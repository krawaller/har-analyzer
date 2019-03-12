import { createStore } from 'redux';
import { FILE_LOADED_SUCCESS } from './file-management/types';

export default createStore((state = {}, action) => {
  switch (action.type) {
    case FILE_LOADED_SUCCESS:
      return {
        fileName: action.fileName,
        fileLastModifiedDate: action.fileLastModifiedDate,
        harJson: action.harJson,
      };
    default:
      return state;
  }
});
