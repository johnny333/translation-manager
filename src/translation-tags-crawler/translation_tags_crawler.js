/**
 * Created by jakub on 21.04.17.
 */
const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const recursive = require('recursive-readdir');
const openDB = require('json-file-db');
const grep = require('grep1');
const vfile = require('to-vfile');
const report = require('vfile-reporter');
const rehype = require('rehype');
const format = require('rehype-format');
const $ = require("jquery");
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
class TranslationTagsCrawler {

    constructor(_dir_path) {
        this.dirPath = _dir_path;
        this.translationReferenceObjects = [];
    }

    searchFilesByName() {
        let self = this;
        recursive(this.dirPath, function (err, files) {
            if (err) {
                console.log("files read error", err);
                return;
            }

            let filteredFiles = _.filter(files, function (filename) {
                let reg = new RegExp('', 'i');
                return filename.match(reg);
            });
            console.log(filteredFiles);
            filteredFiles.forEach(function (path) {
                self.filterFileContent(path, "translate", function (err, result) {
                    self.translationReferenceObjects = self.translationReferenceObjects.concat(result);
                    console.log(self.translationReferenceObjects); //crawler output
                });
            });
        });
    }

    filterFileContent(path, sentence, cb) {
        let referenceObjects = [];
        grep([sentence, path], function (err, stdout, stderr) {
            if (err || stderr) {
                cb(err);
            } else {
                rehype().use(format).process(stdout, function (err, file) {
                    let dom = new JSDOM(file.contents);
                    let allElements = dom.window.document.getElementsByTagName('*');
                    let translateElements = [];
                    for (var i = 0, n = allElements.length; i < n; i++) {
                        if (allElements[i].getAttribute('translate') !== null) {
                            translateElements.push(allElements[i]);
                        }
                    }
                    translateElements.forEach(function (item) {
                        let referenceObject = {};
                        referenceObject.filePath = path;
                        referenceObject.filename = path.replace(/^.*[\\\/]/, '');
                        referenceObject.item = item;
                        referenceObject.tag = 'translate';
                        referenceObject.tagValue = item.getAttribute('translate');
                        referenceObjects.push(referenceObject);
                    });
                    cb(null, referenceObjects);
                });
            }
        });
    }
}
module.exports = TranslationTagsCrawler;