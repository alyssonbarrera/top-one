<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Features

### Authentication

- [x] It should be able to authenticate using e-mail & password;
- [x] It should be able to change the password;

### Products

- [x] It should be able to create a new product;
- [x] It should be able to list all products;
- [x] It should be able to show the product;
- [x] It should be able to update the product;
- [x] It should be able to delete the product;
- [x] It should be able to apply discounts to the product;

### Clients

- [x] It should be able to create a new client;
- [x] It should be able to list all clients;
- [x] It should be able to show the client;
- [x] It should be able to update the client;
- [x] It should be able to delete the client;

### Orders

- [x] It should be able to create a new order;
- [x] It should be able to list all orders;
- [x] It should be able to show the order;
- [x] It should be able to update the order;
- [x] It should be able to delete the order;
- [x] It should be able to set the order status like `processing`, `sent`, `delivered`;
- [x] It should be able to list all orders by status;
- [x] It should be able to list all orders with the status for the client;
- [x] It should be able to notificate the client about the order status;

### Cart

- [x] It should be able to add a product to the cart;
- [x] It should be able to finish the cart and create an order;

## RBAC

Roles & permissions.

### Roles

- Admin
- Vendor

### Permissions table

|                          | Administrator | Vendor
| ------------------------ | ------------- | ------ |
| Create product           | ✅            | ❌     |
| Get product              | ✅            | ❌     |
| Update a product         | ✅            | ❌     |
| Delete a product         | ✅            | ❌     |
| Apply discounts          | ✅            | ❌     |
| Create client            | ✅           | ❌     |
| Get client               | ✅           | ❌     |
| Update a client          | ✅           | ❌     |
| Delete a client          | ✅            | ❌   |
| Create order             | ❌            | ✅     |
| Get order                | ❌            | ✅     |
| Update a order           | ❌            | ✅    |
| Delete a order           | ❌            | ✅    |
| Update order status      | ❌            | ⚠️     |
| Update user password     | ✅            | ❌     |

> ✅ = allowed
> ❌ = not allowed
> ⚠️ = allowed w/ conditions

#### Conditions

- Only author of the order can update the status.

### Documentation

```bash
https://documenter.getpostman.com/view/20700565/2sAY4siitw
```