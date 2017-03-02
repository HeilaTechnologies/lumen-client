import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';
import { select } from 'ng2-redux';

import {
  NilmService,
} from '../../../services';

import {
  INilmStore,
  INilm
} from '../../../store/data';


@Component({
  selector: 'app-installation',
  templateUrl: './installation.page.html',
  styleUrls: ['./installation.page.css']
})
export class InstallationPageComponent implements OnInit {

  @select(['data', 'nilms']) nilmStore$: Observable<INilmStore>;

  public nilm$: Observable<INilm>
  public role$: Observable<string>

  constructor(
    private route: ActivatedRoute,
    private nilmService: NilmService
  ) {
    this.nilmService.loadNilms();

    this.nilm$ = this.nilmStore$
      .combineLatest(route.params)
      .map(([store, params]) => store.entities[params['id']])
      .filter(nilm => !(nilm === undefined))

    this.role$ = this.nilmStore$
      .combineLatest(route.params)
      .map(([store,params]) => {
        //figure out the role for this nilm
        if(store.admin.indexOf(+params['id'])!=-1){
          return 'admin'
        } else if(store.owner.indexOf(+params['id'])!=-1) {
          return 'owner'
        } else {
          return 'viewer'
        }
      })
  }

  ngOnInit() {
  }

}