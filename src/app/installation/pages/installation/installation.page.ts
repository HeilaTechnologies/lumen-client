import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, Subscription } from 'rxjs';
import { select } from '@angular-redux/store';
import {environment } from '../../../../environments/environment'
import {
  NilmService,
} from '../../../services';

import {
  INilm
} from '../../../store/data';

import { ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-installation',
  templateUrl: './installation.page.html',
  styleUrls: ['./installation.page.css']
})
export class InstallationPageComponent implements OnInit {

  @select(['data', 'nilms']) nilms$: Observable<INilm[]>;

  public nilm$: Observable<INilm>
  public role$: Observable<string>
  public helpUrl: string;
  private subs: Subscription[];

  constructor(
    private route: ActivatedRoute,
    private nilmService: NilmService
  ) {
    this.helpUrl = environment.helpUrl;
    
    this.subs = [];
  }

  ngOnInit() {

    this.subs.push(this.route.params.subscribe(params => 
      this.nilmService.loadNilm(params['id'])));

    this.nilm$ = this.nilms$.combineLatest(this.route.params)
      .map(([nilms,params]) => nilms[params['id']])
      .filter(nilm => !(nilm === undefined));
  }

  ngOnDestroy(){
    while (this.subs.length > 0)
    this.subs.pop().unsubscribe()
  }

  @ViewChild('childModal') public childModal:ModalDirective;
 
  public showChildModal():void {
    this.childModal.show();
  }
 
  public hideChildModal():void {
    this.childModal.hide();
  }

}
