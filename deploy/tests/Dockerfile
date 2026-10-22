# CI only: a Hostinger-like box (PHP 8.4, Apache + .htaccess, MariaDB client,
# rsync, proc_open disabled) to run the real deploy scripts end to end.
FROM php:8.4-apache

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      mariadb-client rsync curl libicu-dev libpng-dev libjpeg62-turbo-dev libwebp-dev libfreetype-dev libzip-dev \
 && docker-php-ext-configure gd --with-jpeg --with-webp --with-freetype \
 && docker-php-ext-install -j"$(nproc)" gd intl zip bcmath pdo_mysql \
 && a2enmod rewrite headers \
 && rm -rf /var/lib/apt/lists/*

# Same restriction as the Hostinger CLI and web PHP.
RUN echo 'disable_functions=proc_open' > /usr/local/etc/php/conf.d/zz-hostinger.ini
