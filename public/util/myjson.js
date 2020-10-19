const db = require('electron-db');

class Myjson {

    result;

    constructor(mypath) {
        this.dbpath = mypath;
    }

    updateValue(table, name, value) {
        db.updateRow(table, this.dbpath, name, value, (succ, msg) => {
            //
        });
    }

    readValue(table, name) {
        db.getField(table, this.dbpath, name, (succ, data) => {
            if (succ) {
                this.result = data[0];
            } else {
                this.result = false;
            }
        })
        return this.result;
    }

    searchValue(table, search, where) {
        db.search(table, this.dbpath, search, where, (succ, data) => {
            if (succ) {
                this.result = data;
            } else {
                this.result = false;
            }
        });
        return this.result;
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