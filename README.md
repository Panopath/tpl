# tpl
**WIP** 

Node.JS cli tool for code templating and generation, Inspired by [angular/angular-cli](https://github.com/angular/angular-cli) and [littleuniversestudios/angular-cli-tools](https://github.com/littleuniversestudios/angular-cli-tools).

Automatically detects and converts case in code and file name.

# Supported cases
* camelCase
* PascalCase
* snake_case
* param-case

# Example
```bash
npm install -g https://github.com/KevinWang15/tpl

cd dashboard
tpl save ./user dashboardModel
tpl gen dashboardModel ./admin
```

## before
```
└─user
        user.display.component.html
        user.display.component.scss
        user.display.component.ts
        user.edit.component.html
        user.edit.component.scss
        user.edit.component.ts
        user.module.ts
        user.routing.module.ts
```

## after
```
├─admin
│      admin.display.component.html
│      admin.display.component.scss
│      admin.display.component.ts
│      admin.edit.component.html
│      admin.edit.component.scss
│      admin.edit.component.ts
│      admin.module.ts
│      admin.routing.module.ts
│
└─user
        user.display.component.html
        user.display.component.scss
        user.display.component.ts
        user.edit.component.html
        user.edit.component.scss
        user.edit.component.ts
        user.module.ts
        user.routing.module.ts
```

It generates everything correctly, changing ```user``` to ```admin``` and preserving cases.

Generated ```admin.module.ts```:
```typescript
import {NgModule} from '@angular/core';

import {AdminDisplayComponent} from './admin.display.component';
import {AdminEditComponent} from './admin.edit.component';
import {AdminRoutingModule} from './admin.routing.module';

@NgModule({
  imports: [
    AdminRoutingModule
  ],
  declarations: [AdminDisplayComponent, AdminEditComponent]
})
export class AdminModule {
}
```