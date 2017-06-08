import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Angular2TokenService } from 'angular2-token';
import {
  NgRedux,
  select
} from '@angular-redux/store';
import { Http, URLSearchParams } from '@angular/http';
import { normalize } from 'normalizr';
import * as schema from '../../api';
import { IAppState } from '../../app.store';
import {
  IPermission,
  IUserRecords,
  IUserGroupRecords
} from '../../store/data';
import {
  PermissionActions
} from '../../store/data';
import { UserService } from './user.service';
import { UserGroupService } from './user-group.service';

import {
  MessageService
} from '../message.service';


@Injectable()
export class PermissionService {

  @select(['data', 'users', 'entities']) users$: Observable<IUserRecords>;
  @select(['data', 'userGroups', 'entities']) userGroups$: Observable<IUserGroupRecords>;

  public targets$: Observable<PermissionTarget[]>;

  private nilmsWithPermissions: number[];

  constructor(
    //private http: Http,
    private tokenService: Angular2TokenService,
    private ngRedux: NgRedux<IAppState>,
    private messageService: MessageService,
    private userService: UserService,
    private userGroupService: UserGroupService
  ) {
    //keep track of NILM's we retrieve permissions for
    this.nilmsWithPermissions = [];

    this.targets$ = this.users$.combineLatest(this.userGroups$)
      .map(([users, userGroups]) => {
        let targets: PermissionTarget[] = []
        Object.keys(users).reduce((acc: PermissionTarget[], id) => {
          let user = users[id];
          acc.push({
            id: +id,
            name: `${user.first_name} ${user.last_name}`,
            type: 'user'
          })
          return acc;
        }, targets)
        Object.keys(userGroups).reduce((acc: PermissionTarget[], id) => {
          let group = userGroups[id];
          acc.push({
            id: +id,
            name: `${group.name}`,
            type: 'group'
          })
          return acc;
        }, targets)
        return targets;
      });
  }

  public loadPermissions(nilmId: number): void {
    //don't retrieve permissions if we already loaded them
    if (this.nilmsWithPermissions.indexOf(nilmId) > -1) {
      return;
    }
    let params: URLSearchParams = new URLSearchParams();
    params.set('nilm_id', nilmId.toString());
    this.tokenService
      .get('permissions.json', { search: params })
      .map(resp => resp.json())
      .subscribe(
      json => {
        this.nilmsWithPermissions.push(nilmId);
        this.ngRedux.dispatch({
          type: PermissionActions.RECEIVE,
          payload: normalize(json, schema.permissions).entities.permissions
        });
      },
      error => this.messageService.setErrorsFromAPICall(error)
      );
  }

  public removePermission(permission: IPermission): void {
    let params: URLSearchParams = new URLSearchParams();
    params.set('nilm_id', permission.nilm_id.toString());
    this.tokenService
      .delete(`permissions/${permission.id}.json`, { search: params })
      .map(resp => resp.json())
      .subscribe(
      json => {
        this.ngRedux.dispatch({
          type: PermissionActions.REMOVE,
          payload: permission.id
        });
        this.messageService.setMessages(json.messages);
      },
      error => this.messageService.setErrorsFromAPICall(error)
      );
  }

  public createPermission(
    nilmId: number,
    role: string,
    targetId: number,
    targetType: string): Observable<string> {
    let o = this.tokenService
      .post('/permissions.json', {
        nilm_id: nilmId,
        role: role,
        target: targetType,
        target_id: targetId
      })
      .map(resp => resp.json());

    o.subscribe(
      json => {
        this.ngRedux.dispatch({
          type: PermissionActions.RECEIVE,
          payload: normalize(json.data, schema.permission).entities.permissions
        });
        this.messageService.setMessages(json.messages);
      },
      error => this.messageService.setErrorsFromAPICall(error)
    );
    return o;
  }

  public createUserWithPermission(
    nilmId: number,
    role: string,
    userParams: any
  ) {
    let o = this.tokenService
      .put(`permissions/create_user.json`,
      Object.assign({}, userParams,
        {
          nilm_id: nilmId,
          role: role,
        }))
      .map(resp => resp.json());

    o.subscribe(
      json => {
        let data = normalize(json.data, schema.permission)
        this.ngRedux.dispatch({
          type: PermissionActions.RECEIVE,
          payload: data.entities.permissions
        });
        this.messageService.setMessages(json.messages);
      },
      error => this.messageService.setErrorsFromAPICall(error)
    );
    return o;
  }

  public inviteUserWithPermission(
    nilmId: number,
    role: string,
    email: string) {
    let o = this.tokenService
      .put(`permissions/invite_user.json`, {
        email: email,
        nilm_id: nilmId,
        role: role,
        redirect_url: `${window.location.origin}/accept`
      })
      .map(resp => resp.json());

      o.subscribe(
      json => {
        let data = normalize(json.data, schema.permission)
        this.ngRedux.dispatch({
          type: PermissionActions.RECEIVE,
          payload: data.entities.permissions
        });
        this.messageService.setMessages(json.messages);
      },
      error => this.messageService.setErrorsFromAPICall(error)
      );
      return o;
  }

  public loadTargets(): void {
    this.userService.loadUsers();
    this.userGroupService.loadUserGroups();
  }
}

export interface PermissionTarget {
  id: number,
  name: string,
  type: string
}