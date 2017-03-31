import { schema } from 'normalizr';




export const dbElement = new schema.Entity('dbElements',
  {},
  {
    processStrategy: (entity) => {
      if (entity.units == '' || entity.units == null)
        entity.units = 'none'
      return entity;
    }
  });

export const dbStream = new schema.Entity('dbStreams',
  { elements: [dbElement] });

export const dbFolder = new schema.Entity('dbFolders',
  {}, {
    processStrategy: (entity) => {
      if ('subfolders' in entity) {
        entity.shallow = false;
      } else {
        entity.shallow = true
      }
      return entity;
    }
  });
export const dbFolders = new schema.Array(dbFolder);
dbFolder.define({
  subfolders: dbFolders,
  streams: [dbStream]
});

export const db = new schema.Entity('dbs',
  {
    contents: dbFolder
  });

//convert all unix microsecond times to ms times
export const data = new schema.Entity('data', {},
  {
    idAttribute: 'element_id',
    processStrategy: (entity) => {
      if (entity.data != null) {
        entity.data = entity.data.map(d => {
          if (d != null && d.length != 0) {
            d[0] = d[0] / 1e3; //convert to ms
          }
          return d;
        })
      }
      if(entity.start_time != null){
        entity.start_time = entity.start_time/1e3;
      }
      if(entity.end_time != null){
        entity.end_time = entity.end_time/1e3;
      }
      return entity;
    }
  })
export const datas = new schema.Array(data);

export const nilm = new schema.Entity('nilms',
  { db: db });
export const nilms = new schema.Array(nilm);

export const user = new schema.Entity('users')
export const users = new schema.Array(user);

export const permission = new schema.Entity('permissions')
export const permissions = new schema.Array(permission);

export const userGroup = new schema.Entity('user_groups',
  {
    owner: user,
    members: [user]
  });
export const userGroups = new schema.Array(userGroup);