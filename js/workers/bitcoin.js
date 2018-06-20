self.addEventListener('message', function(evt) {
	var id = evt.data.id;
	var fn = functions[evt.data.fn];
	var args = evt.data.args;
	var errorMessage;
	try {
		var result = fn.apply(undefined, args);
	} catch (error) {
		errorMessage = error.message;
	}
	self.postMessage({
		id: id,
		error: errorMessage || null,
		result: result,
	});
}, false);

var functions = {

	/*
		See:
		https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#serialization-format

		And:
		https://bitcoin.stackexchange.com/questions/62533/key-derivation-in-hd-wallets-using-the-extended-private-key-vs-hardened-derivati

		[ magic ][ depth ][ parent fingerprint ][ key index ][ chain code ][ key ]
	*/
	decodeExtendedPublicKey: function(extendedPublicKey, network) {

		var hex = bs58.decode(extendedPublicKey).toString('hex');

		// Expect 82 bytes.
		if (hex.length !== 164) {
			throw new Error('incorrect-number-of-bytes');
		}

		// Check version bytes.
		var version = hex.substr(0, 8).toLowerCase();

		// Check private key constants.
		_.each(network.xprv, function(constants, type) {
			var match = _.contains(constants, version);
			if (match) {
				// Don't allow private keys with this app.
				throw new Error('private-keys-warning');
			}
		});

		// Check public key constants.
		var type = _.findKey(network.xpub, function(constants) {
			return _.contains(constants, version);
		});

		if (!type) {
			throw new Error('invalid-network-byte');
		}

		var isSegwit = _.contains(['p2wpkh-p2sh', 'p2wsh-p2sh', 'p2wpkh', 'p2wsh'], type);
		if (isSegwit) {
			throw new Error('segwit-not-supported');
		}

		// Validate the checksum.
		var checksum = hex.substr(156, 8);
		var hash = functions.sha256sha256(hex.substr(0, 156));

		if (hash.substr(0, 8) !== checksum) {
			// Invalid checksum.
			throw new Error('invalid-checksum');
		}

		// 1 byte: depth: 0x00 for master nodes, 0x01 for level-1 derived keys, ....
		var depth = hex.substr(8, 2);

		// 4 bytes: the fingerprint of the parent's key (0x00000000 if master key)
		var parentFingerPrint = hex.substr(10, 8);
		if (depth === '00' && parentFingerPrint !== '00000000') {
			throw new Error('invalid-parent-fingerprint');
		}

		var index = hex.substr(18, 8);

		// 32 bytes: the chain code
		var chainCode = hex.substr(26, 64);

		// 33 bytes: public key data (0x02 + X or 0x03 + X)
		var compressedPublicKey = hex.substr(90, 66);

		return {
			chainCode: chainCode,
			checksum: hex.substr(156, 8),
			depth: depth,
			index: index,
			parentFingerPrint: parentFingerPrint,
			publicKey: compressedPublicKey,
			type: type,
			version: version,
		};
	},

	/*
		https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#public-parent-key--public-child-key
	*/
	deriveChildKeyAtIndex: function(extendedPublicKey, index, network) {

		if (parseInt(index).toString() !== index.toString()) {
			throw new Error('index-must-be-an-integer');
		}

		try {
			index = new BigNumber(index);
		} catch (error) {
			throw new Error('index-must-be-an-integer');
		}

		if (index.isGreaterThanOrEqualTo(0x100000000)) {
			// Maximum number of child keys is 2^32.
			throw new Error('index-must-be-less-than');
		}

		if (index.isGreaterThanOrEqualTo(0x80000000)) {
			// Hardened child keys start at index 2^31.
			throw new Error('index-no-hardened');
		}

		var decoded = functions.decodeExtendedPublicKey(extendedPublicKey, network);

		// I = HMAC-SHA512(Key = cpar, Data = serP(Kpar) || ser32(i))
		var I = functions.hmacsha512(
			sjcl.codec.hex.toBits(decoded.chainCode),// secret
			decoded.publicKey + functions.leftPadHex(index.toString(16), 8)// data
		);

		// Split I into two 32-byte sequences, IL and IR.
		var IL = I.substr(0, 64);
		var IR = I.substr(64, 64);

		var curve = ecurve.getCurveByName('secp256k1');
		var Kpar = ecurve.Point.decodeFrom(curve, Buffer.from(decoded.publicKey, 'hex'));
		curve.validate(Kpar);

		var pIL = BigInteger.fromBuffer(Buffer.from(IL, 'hex'));

		// In case parse256(IL) >= n, proceed with the next value for i
		if (pIL.compareTo(curve.n) >= 0) {
			return functions.deriveChildKeyAtIndex(extendedPublicKey, index + 1, network);
		}

		// The returned child key is point(parse256(IL)) + Kpar.
		//	= G*IL + Kpar
		var Ki = curve.G.multiply(pIL).add(Kpar);

		if (curve.isInfinity(Ki)) {
			return functions.deriveChildKeyAtIndex(extendedPublicKey, index + 1, network);
		}

		curve.validate(Ki);

		var prefix = decoded.version;
		// Left pad with a leading zero.
		var depth = functions.leftPadHex((new BigNumber('0x' + decoded.depth)).toNumber() + 1, 2);
		var parentFingerPrint = functions.hash160(decoded.publicKey).substr(0, 8);
		// Left pad with leading zeroes.
		var keyIndex = functions.leftPadHex(index, 8);
		var chainCode = IR;
		var compressedKey = Buffer.from(Ki.getEncoded(true)).toString('hex');

		var extendedKey = [
			prefix,
			depth,
			parentFingerPrint,
			keyIndex,
			chainCode,
			compressedKey,
		].join('');

		var checksum = functions.sha256sha256(extendedKey).substr(0, 8);
		var encodedExtendedKey = bs58.encode(Buffer.from(extendedKey + checksum, 'hex'));

		return {
			chainCode: chainCode,
			depth: depth,
			extendedKey: encodedExtendedKey,
			key: compressedKey,
			network: network,
			parentFingerPrint: parentFingerPrint,
		};
	},

	leftPadHex: function(hex, length) {

		for (var index = 0; index < length; index++) {
			hex = '0' + hex;
		}

		return hex.toString(16).substr(-1 * length);
	},

	hmacsha512: function(secret, data) {

		var hmac = new sjcl.misc.hmac(
			secret,
			sjcl.hash.sha512
		);

		return sjcl.codec.hex.fromBits(hmac.encrypt(sjcl.codec.hex.toBits(data)));
	},

	sha256sha256: function(data) {

		return sjcl.codec.hex.fromBits(
			sjcl.hash.sha256.hash(
				sjcl.hash.sha256.hash(
					sjcl.codec.hex.toBits(data)
				)
			)
		);
	},

	hash160: function(data) {

		return sjcl.codec.hex.fromBits(
			sjcl.hash.ripemd160.hash(
				sjcl.hash.sha256.hash(
					sjcl.codec.hex.toBits(data)
				)
			)
		);
	},
};
