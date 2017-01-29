import { Injectable } from '@angular/core';
import { NgRedux } from 'ng2-redux';
import { TreeNode } from 'angular2-tree-component';
import {
  IAppState,
  DbAdminActions,
} from '../../store';
import {
  IStatusMessages,
} from '../../store/db-admin';
import {
  IDb,
  IDbFolder,
  IDbStream,
  IDbElement
} from '../../store/data';
import {
  DbFolderService,
  NilmService,
  DbService,
  parseErrors
} from '../api';

@Injectable()
export class DbAdminService {

  constructor(
    private ngRedux: NgRedux<IAppState>,
    private dbFolderService: DbFolderService,
    private nilmService: NilmService,
    private dbService: DbService
  ) { }

  // ---selectDbRoot: pick the root from tree -----
  public selectDbRoot() {
    this.ngRedux.dispatch({
      type: DbAdminActions.SELECT_DB_ROOT,
      payload: {}
    });
  }

  // ---loadDbFolder: expand a shallow folder -----
  public loadDbFolder(id: number) {
    this.dbFolderService.loadFolder(id)
      .subscribe(success => {
        this.ngRedux.dispatch({
          type: DbAdminActions.CLEAR_PAGE_MESSAGES,
          payload: {}
        });
      }, error => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_PAGE_MESSAGES,
          payload: parseErrors(error)
        })
      })
  }
  // ---selectDbFolder: pick folder from tree -----
  public selectDbFolder(id: number) {
    this.ngRedux.dispatch({
      type: DbAdminActions.SELECT_DB_FOLDER,
      payload: {
        id: id,
      }
    });
    this.ngRedux.dispatch({
      type: DbAdminActions.CLEAR_DB_FOLDER_MESSAGES,
      payload: null
    });
  }

  // ---updateDbFolder: save edits ---------------
  public updateDbFolder(folder: IDbFolder) {
    this.dbFolderService.updateFolder(folder)
      .subscribe(success => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_DB_FOLDER_MESSAGES,
          payload: {
            notices: ['Folder updated']
          }
        });
      }, error => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_DB_FOLDER_MESSAGES,
          payload: parseErrors(error)
        })
      })
  }

  // ---selectDbStream: pick a stream from tree---
  public selectDbStream(id: number) {
    this.ngRedux.dispatch({
      type: DbAdminActions.SELECT_DB_STREAM,
      payload: {
        id: id,
      }
    });
    this.ngRedux.dispatch({
      type: DbAdminActions.CLEAR_DB_STREAM_MESSAGES,
      payload: null
    });
  }

  // ---updateDbStream: save edits ---------------
  public updateDbStream(stream) {
    this.dbFolderService.updateStream(stream)
      .subscribe(success => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_DB_STREAM_MESSAGES,
          payload: {
            notices: ['Stream updated']
          }
        });
      }, error => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_DB_STREAM_MESSAGES,
          payload: parseErrors(error)
        })
      })
  }


  // ---setDbId: work on specified Db -----
  public setDbId(id: number) {
    this.ngRedux.dispatch({
      type: DbAdminActions.SET_DB_ID,
      payload: {
        id: id
      }
    });
  }

  // ---updateDb: save edits ---------------
  public updateDb(db) {
    this.dbService.updateDb(db)
      .subscribe(success => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_DB_MESSAGES,
          payload: {
            notices: ['Database updated']
          }
        });
      }, error => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_DB_MESSAGES,
          payload: parseErrors(error)
        })
      })
  }


  // ---refreshDb: refresh specified Db -----
  public refreshDb(db: IDb) {
    this.dbService.refreshDb(db)
      .subscribe(success => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_PAGE_MESSAGES,
          payload: {
            notices: ['Database refreshed']
          }
        });
      }, error => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_PAGE_MESSAGES,
          payload: parseErrors(error)
        })
      })
  }

  // ---loadNilms: request nilms-----
  public loadNilms() {
    this.nilmService.loadNilms()
      .subscribe(success => { }, error => {
        this.ngRedux.dispatch({
          type: DbAdminActions.SET_PAGE_MESSAGES,
          payload: parseErrors(error)
        })
      })

  }
}