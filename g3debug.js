/**
 * Javascript debugger for printing native types (number, boolean, string, date, 
 * array), functions and objects of any type native, host or custom in the form
 * of:
 * ': -> value' for simple types or, 
 * 'depth: key -> value' for complex ones.
 *
 * @version 0.1.2
 * @author Scripto JS Editor by Centurian Comet.
 * @copyright MIT licence.
 */
(function(g3, $, window, document, undefined){
   /*
    * Add necessary functions from 'g3.utils' namespace.
    */
   g3.utils = g3.utils || {};
   g3.utils.typeOf = function(value) {
      var s = typeof value;
      if (s === 'object') {
         if (value) {
            if (Object.prototype.toString.call(value) === Object.prototype.toString.call([])) { //'[object Array]'
               s = 'array';
            }
         } else {
            s = 'null';
         }
      }
      return s;
   };
   g3.utils.isEmptyObject = function(obj){
      var result = true;
      if(obj === null)
         return result;
      if((typeof obj === 'object') || (typeof obj === 'function')){
         for(var prop in obj){
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
               result = false;
               break;
            }
         }
         //overwrite previous result! (new ECMA 5 properties)
         //FF Error: returns 5 prototype properties on functions and 1 on arrays
         //as their own members!
         if((typeof Object.getOwnPropertyNames === 'function') && (g3.utils.typeOf(obj) === 'object')){
            result = (Object.getOwnPropertyNames(obj).length === 0);
         }
         return result;
      }
      return result;
   };
   g3.utils.htmlList = function(type) {
      if(!type || (g3.utils.typeOf(type) != 'string') || ((type.toLowerCase() != 'u') && 
        (type.toLowerCase() != 'o')) || (arguments.length <= 1))
         return false;
      var result = "<" + type.toLowerCase() + "l><li>";
      var args;
      if(g3.utils.typeOf(arguments[1]) === 'array')
         args = arguments[1];
      else
         args = Array.prototype.slice.call(arguments, 1);
      result += args.join("</li><li>");
      result += "</li></" + type.toLowerCase() + "l>";
      return result;
   };
   
/*********************************Object debug()********************************
* Returns a stringify form of an object for debugging purposes. Internally, it 
* stores a flattened representation of the object's tree-structure.
* @module {g3.debug}
* @constructor
* @param {Object} 'obj' the object to stringify.
* @param {Number} 'maxDepth' the maximum depth to look for when a property is an 
* object reference which in turn can contain other object references. It's 
* 0-based starting with the first level childs.
* @param {Boolean} 'force' If it evaluates to true, it forces debugger to  
* analyse the first argument bypassing the result of 'g3.utils.isEmptyObject()'
* which fails on css host objects. 
* @return {Object} Returns an object. Circular references are not followed 
* because they are recognised on first meet. The internal structure that is 
* built is a flattened representation of a tree which is a 2-dimensional 
* array(i, j) whose index i stores a 3-cell linear sub-array where: i. index 0, 
* at (i, 0), keeps the depth of the current member, ii. index 1, at (i, 1), 
* keeps the name of the member and iii. index 2, at (i, 2), keeps the member's 
* value. 
* This representation exchibits some interesting behaviours:
* 1) Between two successive depths with the same value, n <- (i, 0) & (i+j, 0), 
* exist all members of the member-object at (i, 1) as in the following example:
* members-objects|(i+j,0)->depth|(i+j,1)->member|(i+j, 2)->value
* .............  | .........    | .........     | .........
* |--[a]         |(i,   0)->n   |(i,   1)->'a'  |(i,   1)->'custom object' <---|
* |   |--[b]     |(i+1, 0)->n+1 |(i+1, 1)->'b'  |(i+1, 1)->'custom object' \   | members of
* |   |   |--[c] |(i+2, 0)->n+2 |(i+2, 1)->'c'  |(i+2, 1)->'value of c'    |----
* |   |--[d]     |(i+3, 0)->n+1 |(i+3, 1)->'d'  |(i+3, 1)->'value of d'    /
* |--[e]         |(i+4, 0)->n   |(i+4, 1)->'e'  |(i+4, 1)->'value of e'
* ............   | .........    | .........     | .........
* 2) Similar, successive entries with the same depth n are all members of the 
* object at depth n-1 at the entry immediate before them. Example: at n+1 we can 
* see 2 members of an object at depth (n+1)-1 = n <- (i, 0).
* @function {g3.debug.toString}
* @return {String} A string representation of the structure based on key-value
* pairs in depth defined during construction. Each pair ends with a newline 
* character, i.e. '\n'.
* @function {g3.debug.toHtml}
* @return {String} An html representation of the structure based on key-value
* pairs in depth defined during construction. Each pair ends with a break 
* character, i.e. '<br \>'.
* @function {g3.debug.formatRow}
* Formats a single array that is passed as argument to an html string. It's a 
* helper function to be used by 'toHtml()' and 'popup()' methods.
* @param {Array} 'arr' A single array with 3 entries: [depth, key, value].
* @return {String} An html representation of the array entry.
* @function {g3.debug.popup}
* Opens a new window and writes an html string with formation that follows the 
* passed argument.
* @param {String} 'tag' One of the strings: ['pre', 'o', 'u'] with default value 
* 'pre'.
* @return {Null}
*
* @author Scripto JS Editor by Centurian Comet.
* @copyright MIT licence.
*******************************************************************************/
   g3.debug = function(obj, maxDepth, force){ //construct with argument
      var tree = [], refs = [], max;
      refs.push( [ 0, obj ] );
      if((maxDepth === 0) || ((g3.utils.typeOf(maxDepth) === 'number') && (maxDepth > 0)))
         max = maxDepth;
      else
         max = -1;
      function traverse(obj, i){
         var value, str = '', tmp = '', circular, found, iterate = false;
         for (var property in obj){
            iterate = true;
            found = false;
            //case: Mozila's number-properties of 'style' object, ha-ha-ha!!!
            property += '';
            try{
               value = obj[property];
            }catch(e){
               str = [-1, 'Error:', e];
               //new record
               tree.push(str);
               break;
            }
            str = [i, property, value];
            //new record
            tree.push('');
            /* 1. not recursion
             * ----------------
             */
            if(value === null){
               tmp = 'null';
               found = true;
            }else if(g3.utils.typeOf(value) === 'undefined'){
               tmp = 'undefined';
               found = true;
            }else if(value === ''){
               tmp = '\'\'';
               found = true;
            }else if (g3.utils.typeOf(value) === 'boolean'){
               tmp = (value)?'\'true\'':'\'false\'';
               found = true;
            }else if (g3.utils.typeOf(value) === 'string'){
               tmp = '\'' + value + '\'';
               found = true;
            }else if (g3.utils.typeOf(value) === 'number'){
               tmp = value;
               found = true;
            }else if(g3.utils.typeOf(value) === 'array'){
               tmp = '[' + value + ']';
               found = true;
            }
            if(found){
               str[2] = tmp;
               tree[tree.length - 1] = str;
            /* 2. recursion or not?
             * --------------------
             */
            }else if ((g3.utils.typeOf(value) === 'function') || (g3.utils.typeOf(value) === 'object')){
               circular = false;
               for(var j = 0; j < refs.length; j++){
                  if(refs[j][1] === value){
                     tmp = '\'contains a circular reference to object at index ' + refs[j][0]+'\'';
                     circular = true;
                     break;
                  }
               }
               if(!circular){
                  if(g3.utils.typeOf(value) === 'object'){
                     refs.push( [ tree.length - 1, value ] );
                     tmp = '\'object\'';
                     if(value.toString)
                        tmp += value.toString() + '';
                  }else if(g3.utils.typeOf(value) === 'function'){
                     tmp = '\'function\'';
                     if(value.toString){
                        tmp += ' [' + value.toString().slice(0, value.toString().indexOf('{')+1).replace(/\n|\r|[\b]/g, '') + '...]';
                     }
                  }
               }
               str[2] = tmp;
               tree[tree.length - 1] = str;
               //recursion with new 2nd arg but keep original!
               if(!circular && ((max < 0) || (i < max))){
                  traverse(value, i+1);
               }
            /* 3. fallback
             * -----------
             */
            }else{ //some value check was missed!
               str[2] = 'value check was missed: ' + str[2];
               tree[tree.length - 1] = str;
            }
         }
         //even a debugger needs to be debugged! Not for production use!
         //new record
         /*if(!iterate){
            str = [i, '\'can\'t iterate on object/function\'', obj];
            tree.push(str);
         }*/
      };
      //for..in loop fails on functions with no members, null, empty objects, empty arrays, booleans, dates, numbers
      if(!force && g3.utils.isEmptyObject(obj)){
         var str;
         if(typeof obj === 'undefined')
            str = 'undefined';
         else if(obj === null)
            str = 'null';
         else if(obj === '')
            str = '\'\'';
         else
            str = obj.toString();
         if(g3.utils.typeOf(obj) === 'array')
            str = '[]';
         else if(g3.utils.typeOf(obj) === 'object')
            str = '{}';
         else if(g3.utils.typeOf(obj) === 'function')
            str = 'function(){}';
         tree.push(['', '', str]);
      }else
         traverse(obj, 0);
      return {
         toString: function(){
            var tmp ='';
            for(var i = 0; i < tree.length; i++)
               //tmp += tree[i].join(', ').replace(',', '->')+'\n';
               tmp += tree[i][0] + ': ' + tree[i][1] + ' -> ' + tree[i][2] + '\n';
            return tmp;
         },
         toHtml: function(){
            var tmp ='';
            for(var i = 0; i < tree.length; i++)
               tmp += '<span style="margin-left: '+tree[i][0]*2+'em">'+this.formatRow(tree[i])+'</span>'+'<br />';
            return tmp;
         },
         formatRow: function(arr){
            var quotes = ['\'object\'', '\'function\'', 'circular reference'], 
            pos = -1, circular = false;
            if(arr[0] == -1)
               return '<span style="color: red">' + arr[0] + ': ' + arr[1] + ' -> ' + arr[2] + '</span>';
            for(var i = 0; i < quotes.length; i++){
               pos = (arr[2] + '').lastIndexOf(quotes[i]);
               if(pos >= 0){
                  if(i === 2)
                     circular = true;
                  break;
               }
            }
            if(pos >= 0)
               arr[2] = '<span style="color: ' + ((circular)? 'red': 'blue') + '">' + arr[2] + '</span>';
            return (arr[0] + ': ' + arr[1] + ' -> ' + arr[2]);
         },
         popup: function(tag){
            if(!tag || (typeof tag !== 'string'))
               tag = 'pre';
            tag = tag.toLowerCase();
            var tags = ['pre', 'o', 'u'];
            var found = false;
            for(var i = 0; i < tags.length; i++)
               if(tag === tags[i]){
                  found = true;
                  break;
               }
            if(!found)
               tag = 'pre';
            var w = window.open("about:blank");
            w.document.open();
            w.document.writeln("<HTML><BODY>");
            if(tag === 'pre'){
               w.document.writeln("<PRE>");
               w.document.writeln(this.toString());
               w.document.writeln("</PRE>");
            }
            if((tag === 'u') || (tag === 'o')){
               var list = [];
               for(var i = 0; i < tree.length; i++)
                  list[i] = '<span style="margin-left: '+tree[i][0]*2+'em">'+this.formatRow(tree[i])+'</span>';
               w.document.writeln(g3.utils.htmlList(tag, list));
            }
            w.document.writeln("</BODY></HTML>");
            w.document.close();
         }
      };
   };
}(window.g3 = window.g3 || {}, jQuery, window, document));
