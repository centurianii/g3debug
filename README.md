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

I hope some answers are answered well with a helpful object like 'jsdebug'.

Internally, the whole design exploits a variation of the module pattern and builds on a bigger library as it would be revealed in the forthcoming projects.

A note on my library symbol: 
-------------------------------------
it's the '$$' internally but if you edit it at the last line (window.$$ = window.$$ || {}) you can name it whatever you want and call it like so externally!
Some calls: 
//debug 'obj' up to 5 levels deep and write the results to a new window
//wrapped as an ordered list
$$.utils.debug(obj, 5).popup('o');
//the same as above but with no formation inside <pre></pre> tags
$$.utils.debug(obj, 5).popup(); //or, $$.utils.debug(obj, 5).popup('pre');

A note on jQuery: 
-----------------------
my library is independent but can become a jQuery plugin!

A note on modularity:
----------------------------
Everything can be broken apart to pieces and become part of different files that are called by <script></script> tags:
<script src="utils.js"></script>
<script src="debug.js"></script>
...
The only restriction is to wrap the code in an anonymous self-invoking function like so:
(function($$, $, window, document, undefined){
...
}(window.$$ = window.$$ || {}, jQuery, window, document));
Issues that was faced:
- handling js primitive types
- browser compatibility
- handling circular references
- testing the dreadful 'StyleSheet' object especially with Mozila's number-attributes or even 'document.body' (see http://stackoverflow.com/questions/957537/how-can-i-print-a-javascript-object)
- representing internally a tree as a single array, what I call the 'flattened tree representation' already successfully tested on my bigger projects :)

Have fun!

