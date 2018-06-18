# How to Configure for Lightning Network

Unfortunately, using the Lightning Network to receive payments is not easy (yet!). For those of you who have some technical skills to do so, we have prepared this guide to help you understand how you can configure your CryptoTerminal application to work with your own Lightning Network (LN) node.

Steps:
1. [Setup Your Own LN Node](#setup-your-own-ln-node)
2. [Setup a reverse proxy with nginx](#setup-a-reverse-proxy-with-nginx)
3. [Configure the CryptoTerminal App](#configure-the-cryptoterminal-app)
4. [Test](#test)


## Setup Your Own LN Node

You will need to setup your own, secure LN node (using the [lnd](https://github.com/lightningnetwork/lnd) software). See [this guide](https://dev.lightning.community/guides/installation/) for a technical step-by-step.


## Setup a reverse proxy with nginx

A reverse proxy in front of your LND node is necessary for a couple reasons:
* To allow the CryptoTerminal application to use its [REST API](https://app.swaggerhub.com/apis/lnd-rest/rpc-proto/master) by properly handling [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) requests.
* To whitelist only the few REST API end-points that are needed by CryptoTerminal.


### Install nginx

You should first install nginx on the same server where you have installed your LN node. If you are unsure how to do this, the [official installation guide](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/) is a good starting point.


### Configure custom domain

Add a DNS record for your custom domain (or sub-domain) that points to the server where you have your LN node. You will likely need to wait some time before this new DNS entry propagates through the internet. You can check for DNS records with the following command:
```bash
dig -type ALL your-domain.example
```

Once the DNS record has propagated, you can request an SSL certificate from [Lets Encrypt](https://letsencrypt.org/). This [short guide](https://www.nginx.com/blog/using-free-ssltls-certificates-from-lets-encrypt-with-nginx/) may help with this step.

Below is a sample nginx virtual host configuration that will proxy requests to the lnd REST API. Be sure you replace all instances of `YOUR_DOMAIN` with the actual domain name that you will be using.
```
server {
	listen 80;
	server_name YOUR_DOMAIN;

	# For LetsEncrypt's certbot to validate the domain ownership.
	location ~ \.well-known/acme-challenge/ {
		root /var/www/YOUR_DOMAIN;
	}

	location / {
		rewrite ^ https://YOUR_DOMAIN$request_uri? permanent;
	}
}

server {
	listen 443 ssl;
	server_name YOUR_DOMAIN;

	ssl_certificate		 /etc/nginx/ssl/YOUR_DOMAIN/fullchain.pem;
	ssl_certificate_key	 /etc/nginx/ssl/YOUR_DOMAIN/privkey.pem;

	ssl_prefer_server_ciphers On;
	ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
	ssl_ciphers ECDH+AESGCM:ECDH+AES256:ECDH+AES128:DH+3DES:!ADH:!AECDH:!MD5;

	add_header Strict-Transport-Security "max-age=31536000";
	access_log off;
	error_log off;

	# Don't send nginx version number in header or error pages.
	server_tokens off;

	# Add invoice.
	# HTTP POST /v1/invoices
	location ~ ^/v1/invoices$ {

		# For all HTTP OPTIONS requests, respond with 200 OK.
		if ($request_method = 'OPTIONS') {
			add_header 'Access-Control-Allow-Origin' '*' always;
			add_header 'Access-Control-Allow-Credentials' 'true' always;
			add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
			add_header 'Access-Control-Allow-Headers' '*' always;
			add_header 'Access-Control-Max-Age' 1728000;
			add_header 'Content-Type' 'text/plain charset=UTF-8';
			add_header 'Content-Length' 0;
			return 204;
		}

		if ($request_method != 'POST') {
			add_header 'Access-Control-Allow-Origin' '*' always;
			add_header 'Access-Control-Allow-Credentials' 'true' always;
			add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
			add_header 'Access-Control-Allow-Headers' '*' always;
			return 404;
		}

		# Proxy the request to the LND REST interface.
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header Host $http_host;
		proxy_set_header X-NginX-Proxy true;

		proxy_pass https://localhost:8003;
		proxy_ssl_certificate /home/lnd/.lnd/tls.cert;
		proxy_ssl_certificate_key /home/lnd/.lnd/tls.key;

		add_header 'Access-Control-Allow-Origin' '*' always;
		add_header 'Access-Control-Allow-Credentials' 'true' always;
		add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
		add_header 'Access-Control-Allow-Headers' '*' always;
	}

	# Get a specific invoice
	# HTTP GET /v1/invoice/HEX_REF
	location ~ ^/v1/invoice/[a-zA-Z0-9]+$ {

		# For all HTTP OPTIONS requests, respond with 200 OK.
		if ($request_method = 'OPTIONS') {
			add_header 'Access-Control-Allow-Origin' '*' always;
			add_header 'Access-Control-Allow-Credentials' 'true' always;
			add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
			add_header 'Access-Control-Allow-Headers' '*' always;
			add_header 'Access-Control-Max-Age' 1728000;
			add_header 'Content-Type' 'text/plain charset=UTF-8';
			add_header 'Content-Length' 0;
			return 204;
		}

		if ($request_method != 'GET') {
			add_header 'Access-Control-Allow-Origin' '*' always;
			add_header 'Access-Control-Allow-Credentials' 'true' always;
			add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
			add_header 'Access-Control-Allow-Headers' '*' always;
			return 404;
		}

		# Proxy the request to the LND REST interface.
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header Host $http_host;
		proxy_set_header X-NginX-Proxy true;

		proxy_pass https://localhost:8003;
		proxy_ssl_certificate /home/lnd/.lnd/tls.cert;
		proxy_ssl_certificate_key /home/lnd/.lnd/tls.key;

		add_header 'Access-Control-Allow-Origin' '*' always;
		add_header 'Access-Control-Allow-Credentials' 'true' always;
		add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
		add_header 'Access-Control-Allow-Headers' '*' always;
	}

	# Catch remaining requests.
	location / {
		add_header 'Access-Control-Allow-Origin' '*' always;
		add_header 'Access-Control-Allow-Credentials' 'true' always;
		add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
		add_header 'Access-Control-Allow-Headers' '*' always;
		return 404;
	}
}
```


## Configure the CryptoTerminal App

In the settings area of the app, enable Bitcoin (LN) and then navigate to its settings page.

In the "API URL" field, enter the full URL (including `https`) to the custom domain that points to your LN node. For example: `https://your-domain.example`.

Use the following command in your LN server to get the invoice macaroon encoded in hex format:
```bash
MACAROON_PATH="<replace with path to invoice.macaroon file>"; \
echo "$(xxd -ps -u -c 1000 $MACAROON_PATH)"
```
Enter this value in the app in the "Invoice Macaroon" field.


## Test

To test if everything is properly configured:
* Go to the payment screen (where you enter the payment amount)
* Enter an amount
* Select Bitcoin (LN) as the payment method

If you see a QR code then everything is setup. Try to pay the invoice encoded in the QR code by scanning it with an LN mobile wallet application.
