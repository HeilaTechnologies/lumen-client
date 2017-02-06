import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Angular2TokenService } from 'angular2-token';
import { NgRedux } from 'ng2-redux';
import { Http, URLSearchParams } from '@angular/http';
import { normalize } from 'normalizr';
import { Router } from '@angular/router';

import * as schema from '../../api';

import {
  parseErrors
} from './index';

import {
  UserActions
} from '../../store/data';

import {
  PageActions,
  createMessage,
  IAppState
} from '../../store';

@Injectable()
export class SessionService {


  constructor(
    //private http: Http,
    private tokenService: Angular2TokenService,
    private ngRedux: NgRedux<IAppState>,
    private router: Router
  ) { }

  public login(email: string, password: string): void {
    this.tokenService.signIn({"email": email, "password": password})
      .map(resp => resp.json())
      .do(json => this.setUser(json.data))
      .subscribe(success => {
        this.router.navigate(['/home']);
      }, error => {
        let msgs = error.json().errors;
        this.ngRedux.dispatch({
          type: PageActions.SET_MESSAGES,
          payload: createMessage(msgs,"error")
        })
      })
  }

  public logout(email: string, password: string): void {
    this.tokenService.signOut()
      .map(resp => resp.json())
      .do(json => this.setUser(json.data))
      .subscribe(success => {
        this.ngRedux.dispatch({
          type: PageActions.SET_MESSAGES,
          payload: createMessage(["you have logged out"],"notice")
        });
      }, error => {
        this.ngRedux.dispatch({
          type: PageActions.SET_MESSAGES,
          payload: createMessage(["error logging out"],"error")
        })
      })
  }
  public validateToken(): void{
    this.tokenService.validateToken()
      .map(resp => resp.json())
      .do(json => this.setUser(json.data))
      .subscribe(
        success => {}, 
        error => {}
      )
  }
  private setUser(json) {
      this.ngRedux.dispatch({
        type: UserActions.RECEIVE,
        payload: json
      });
    }
}