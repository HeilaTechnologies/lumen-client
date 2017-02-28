import { 
  Component, 
  Input, 
  ViewChild, 
  OnInit 
} from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/modal';

import {
  UserGroupService
} from '../../../services';

import{
  IUserGroupRecord,
} from '../../../store';

@Component({
  selector: 'app-account-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent implements OnInit {
  @ViewChild('newGroupModal') public newGroupModal: ModalDirective;
  @Input() ownedGroups: IUserGroupRecord[];
  @Input() memberGroups: IUserGroupRecord[];
  

  constructor(
    private userGroupService: UserGroupService
  ) {
    
   }

  ngOnInit() {
  }

  createGroup(values: any){
    console.log(values);
    this.userGroupService
      .createGroup(values.name, values.description)
      .subscribe(result => this.newGroupModal.hide());
  }

}
