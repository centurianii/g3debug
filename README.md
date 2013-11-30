jsdebug
=======

Javascript debugger

Parsing the members of an object should be relatively easy but, what happens when:

+ we want to represent the tree-hierarchy of an object as a string for debugging (or not) purposes?
+ we want to provide a formatting when exporting the hierarchy?
+ there are circular references from a member to it's parent or even worse from a member deep in the hierarchy tree to another one hidden between others?
+ there are different type of values that are printed in a non-descriptive way? (like the value of null, '' empty string, undefined, true/false etc.)
+ we try to parse custom, host, native, DOM or CSSOM objects?
+ we want to easily extend the behaviour of our debugger?

I hope some answers are answered well with a helpful object like '<b>jsdebug</b>'.

Suppose the following object with circular references:
<pre>
        obj2
         |__ foo = 'bar'
         |__ loop2 = obj2
         |            :
         |__ another = obj1
                        |__ a1 = 1
                        |__ b1 = 'baz'
                        |__ loop1 = obj1
                        |            :
                        |__ c1 = true
                        |__ d1 = ''
                        |__ e1 = [1,2,3]
</pre>
The display then is:
<ol>
<li><span style="margin-left: 0em">0, foo, 'bar'</span></li>
<li><span style="margin-left: 0em">0, loop2, <span style="color: red">'contains a circular reference to object at index 0'</span></span></li>
<li><span style="margin-left: 0em">0, another, <span style="color: blue">'object'</span></span></li>
<li><span style="margin-left: 2em">1, a1, 1</span></li>
<li><span style="margin-left: 2em">1, b1, 'baz'</span></li>
<li><span style="margin-left: 2em">1, loop1, <span style="color: red">'contains a circular reference to object at index 2'</span></span></li>
<li><span style="margin-left: 2em">1, c1, 'true'</span></li>
<li><span style="margin-left: 2em">1, d1, ''</span></li>
<li><span style="margin-left: 2em">1, e1, [1,2,3]</span></li>
</ol>
See it at: http://jsfiddle.net/centurianii/92Cmk/36/

Design
------
Internally, the whole design exploits a variation of the module pattern and builds on a bigger library as it would be revealed in the forthcoming projects.

A note on my library symbol: 
-------------------------------------
It's the '$$' internally but if you edit it at the last line (window.$$ = window.$$ || {}) you can name it whatever you want and call it like so externally!
Some calls:
<pre>
//debug 'obj' up to 5 levels deep and write the results to a new window
//wrapped as an ordered list
$$.utils.debug(obj, 5).popup('o');
//the same as above but with no formation inside &lt;pre&gt;&lt;/pre&gt; tags
$$.utils.debug(obj, 5).popup(); //or, $$.utils.debug(obj, 5).popup('pre');
</pre>

A note on jQuery: 
-----------------------
My library is independent but can become a jQuery plugin!

A note on modularity:
----------------------------
Everything can be broken apart to pieces and become part of different files that are called by &lt;script&gt;&lt;/script&gt; tags:

<pre>
&lt;script src="utils.js"&gt;&lt;/script&gt;
&lt;script src="debug.js"&gt;&lt;/script&gt;
...
</pre>
The only restriction is to wrap the pieces to anonymous self-invoking functions like so:
<pre>
(function($$, $, window, document, undefined){
...
}(window.$$ = window.$$ || {}, jQuery, window, document));
</pre>

Issues that was faced:
----------------------
- handling js primitive types
- browser compatibility
- handling circular references
- testing the dreadful 'StyleSheet' object especially with Mozila's number-attributes or even 'document.body' (see http://stackoverflow.com/questions/957537/how-can-i-print-a-javascript-object)
- representing internally a tree as a single array, what I call the 'flattened tree representation' already successfully tested on my bigger projects :)

Have fun!

