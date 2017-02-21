import { Component, Input, OnInit } from '@angular/core';
import { TreeNode } from 'angular2-tree-component';
import { Observable, Subscription } from 'rxjs';
import { select } from 'ng2-redux';

import {
  DbAdminService,
  DbFolderService,
  DbService,
  DbAdminSelectors,
} from '../../services';

import {
  INilmRecord,
  IDbRecords
} from '../../store';

@Component({
  selector: 'app-db-admin',
  templateUrl: './db-admin.page.html',
  styleUrls: ['./db-admin.page.css']
})
export class DbAdminPageComponent implements OnInit {

  @Input() nilm: Observable<INilmRecord>
  @select(['data', 'dbs']) dbs$: Observable<IDbRecords>;

  public treeOptions = {};
  private subs: Subscription[];

  constructor(
    public dbService: DbService,
    private dbAdminService: DbAdminService,
    private dbFolderService: DbFolderService,
    public dbAdminSelectors: DbAdminSelectors,
  ) {
    this.treeOptions = {
      getChildren: this.getChildren.bind(this)
    };
    this.subs = [];

  };

  public getChildren(node: TreeNode) {
    this.dbFolderService.loadFolder(node.data.id);
  }

  public selectNode(event) {
    let node: TreeNode = event.node;
    switch (node.data.type) {
      case 'root':
        this.dbAdminService.selectDbRoot();
        return;
      case 'dbFolder':
        this.dbAdminService.selectDbFolder(node.data.id);
        return;
      case 'dbStream':
        this.dbAdminService.selectDbStream(node.data.id);
        return;
      default:
        console.log(`unknown type ${node.data.type}`);
    }
  }

  ngOnInit() {
    this.subs.push(
       this.nilm
        .combineLatest(this.dbs$)
        .subscribe(([nilm, dbs]) => {
          if (dbs[nilm.db_id] === undefined) {
            this.dbService.loadDb(nilm.db_id);
          }
        })
    );
    this.subs.push(
      this.nilm
        .subscribe(nilm => {
          this.dbAdminService.setDbId(nilm.db_id);
          this.dbAdminService.selectDbRoot();
        })
    );
  }

  ngOnDestroy(){
    for (var sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
