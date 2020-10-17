const db = require('electron-db');

class Myjson {

    constructor(mypath) {
        this.dbpath = mypath;
    }

    updateValue(table, name, value) {
        db.updateRow(table, this.dbpath, name, value, (succ, msg) => {
            //
        });
    }

    readValue(table, name) {
        let res = 0;
        db.getField(table, this.dbpath, name, (succ, data) => {
            if (succ) {
                res = data[0];
            }
        })
        return res;
    }

    createTable(name) {
        if (!db.tableExists(name, this.dbpath)) {
            db.createTable(name, this.dbpath, (succ, msg) => {
                //
            })
        }
    }

    deleteTable(name) {
        db.clearTable(name, this.dbpath, (succ, msg) => {
            //
        })
    }

    insertValue(table, data) {
        db.insertTableContent(table, this.dbpath, data, (succ, msg) => {
            //
        })
    }


}

module.exports = Myjson