## Description

User Module

## Installation

The User Module is included with the initial setup of Ebtheme. If you do not need this module, Follow these steps.

#### Steps

- Remove /apps/api/src/modules/users folder

- Remove folowing code from apps/api/src/app.module.ts
```bash
import { UsersModule } from './modules/users/users.module';

and UsersModule from import array

and UsersModule from include array of graphql
```