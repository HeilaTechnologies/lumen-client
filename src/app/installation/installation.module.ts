import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { 
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { TreeModule } from 'angular-tree-component';
import { 
  AlertModule,
  ModalModule,
  TabsModule
 } from 'ngx-bootstrap';

import { COMPONENTS } from './components';
import { TABS } from './tabs';
import { PIPES } from './pipes';
import { InstallationPageComponent } from './pages';
import { InstallationService } from './installation.service'
import { InstallationSelectors } from './installation.selectors';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    TreeModule,
    NgSelectModule,
    SharedModule,
    AlertModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot()
  ],
  declarations: [
    COMPONENTS,
    TABS,
    PIPES,
    InstallationPageComponent
  ],
  providers: [
    InstallationService,
    InstallationSelectors
  ],
  exports: [
    InstallationPageComponent
  ]
})
export class InstallationModule { }
