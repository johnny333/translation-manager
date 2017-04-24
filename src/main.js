/**
 * Created by jakub on 21.04.17.
 */
const FileManagerModule = require('./translation-tags-crawler/file_manager');
const fileManager = new FileManagerModule('./demo');
fileManager.searchFilesByName();