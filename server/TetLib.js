// Grabbed this from https://github.com/icedTet
'use strict';
// eslint-disable-next-line no-unused-vars
exports.__esModule = true;
exports.TetLib = void 0;
exports.TetLib = {
  sleep: function (delay) {
    return new Promise(function (resolve) {
      return setTimeout(resolve, delay);
    });
  },
  text_truncate: function (str, len) {
    var array = str.split('');
    array.length = len - 3;
    return array.join('') + '...';
  },
  SecsToFormat: function (string) {
    var sec_num = parseInt(string, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - hours * 3600) / 60);
    var seconds = sec_num - hours * 3600 - minutes * 60;
    var strHrs = '' + (hours < 10 ? '0' : '') + hours;
    var strMins = '' + (minutes < 10 ? '0' : '') + minutes;
    var strSecs = '' + (seconds < 10 ? '0' : '') + seconds;
    return strHrs + ':' + strMins + ':' + strSecs;
  },
  genID: function (length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },
  /**
   *
   * @param {Array<*>} array
   * @param {Number} length
   * @returns {Array<Array<*>>}
   */
  splitArrayIntoChunks: function (array, length) {
    var res = [];
    while (array.length >= length) {
      res.push(array.splice(0, length));
    }
    if (array.length) res.push(array);
    return res;
  },
  /**
   * Shuffles array in-place;
   * @param {Array<*>} array
   * @returns {Array<*>}
   */
  shuffle: function (array) {
    var _a;
    var counter = array.length;
    while (counter > 0) {
      var index = Math.floor(Math.random() * counter);
      counter--;
      var temp = array[counter];
      //@ts-expect-error
      (_a = [array[index], array[counter]]),
        (array[counter] = _a[0]),
        (array[index] = _a[1]);
    }
    return array;
  },
  /**
   * Converts large number to a prefixed number (eg: 1435839 => 1.43m)
   * @param {Number} num
   * @returns {String}
   */
  formatNumber: function (num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(3).replace(/\.0$/, '') + 'b';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(3).replace(/\.0$/, '') + 'm';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(3).replace(/\.0$/, '') + 'k';
    }
    return num;
  },
};
exports['default'] = exports.TetLib;
