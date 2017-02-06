
import {EditFolderComponent} from './edit-folder/edit-folder.component';
import {EditStreamComponent} from './edit-stream/edit-stream.component';
import {MessagesComponent} from './messages/messages.component';
import {EditDbComponent} from './edit-db/edit-db.component';
import {SessionComponent} from './session/session.component';
// export here for object imports
export {
EditFolderComponent,
EditStreamComponent,
EditDbComponent,
MessagesComponent,
SessionComponent
};

// export here for injecting the dependencies (e.g. at bootstrap)
export default [
  EditDbComponent,
  EditFolderComponent,
  EditStreamComponent,
  SessionComponent
];
