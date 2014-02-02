g3debug
=======

Javascript debugger

Parsing the members of an object should be relatively easy but, what happens when:

+ we want to represent the tree-hierarchy of an object as a string for debugging (or not) purposes?
+ we want to provide a formatting when exporting the hierarchy?
+ there are circular references from a member to it's parent or even worse from a member deep in the hierarchy tree to another one hidden between others?
+ there are different type of values that are printed in a non-descriptive way? (like the value of null, '' empty string, undefined, true/false etc.)
+ we try to parse custom, host, native, DOM or CSSOM objects?
+ we want to easily extend the behaviour of our debugger?

I hope some answers are answered well with a helpful object like '<b>g3debug</b>'.

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
See it at: http://jsfiddle.net/centurianii/wLJz4/1/

Debug it
========
<ul>
<li>Get a string with newlines <code>\n</code> describing the analyzed object at unlimited depth: <code>g3.debug(obj).toString()</code>.</li>
<li>Get a string with newlines describing only the first members of the analyzed object: <code>g3.debug(obj, 0).toString()</code>.</li>
<li>Get a string with newlines describing the analyzed object up at depth n: <code>g3.debug(obj, n).toString()</code>.</li>
<li>Get an html describing the analyzed object up at depth n: <code>g3.debug(obj, n).toHtml()</code>.</li>
<li>Get an ordered list describing the analyzed object up at depth n in a new window: <code>g3.debug(obj, n).popup('o')</code>.</li>
<li>Get an unordered list describing the analyzed object up at depth n in a new window: <code>g3.debug(obj, n).popup('u')</code>.</li>
<li>Get a preformated description using method <code>debug.toString()</code> of the analyzed object up at depth n in a new window: <code>g3.debug(obj, n).popup('pre')</code> or <code>g3.debug(obj, n).popup()</code>.</li>
</ul>

Depends
=======
None.

Design
======
Internally, the whole design exploits a variation of the module pattern and builds on a bigger library as it would be revealed in the forthcoming projects.

A note on my library symbol: 
-------------------------------------
It's the <code>$$</code> internally but if you edit it at the last line <code>window.$$ = window.$$ || {}</code> you can name it whatever you want and call it like so externally!<br />
Now, it's <code>g3</code>, see: <b>Update</b>.<br />

A note on jQuery: 
-----------------------
My library is independent but can become a jQuery plugin with a simple assignment!

A note on modularity:
----------------------------
Everything can be broken apart to pieces and become part of different files that are called by &lt;script&gt;&lt;/script&gt; tags:

<pre>
&lt;script src="jsutils.js"&gt;&lt;/script&gt;
&lt;script src="jsdebug.js"&gt;&lt;/script&gt;
...
</pre>
The only restriction is to wrap the pieces to anonymous self-invoking functions like so:
<pre>
(function($$, $, window, document, undefined){
...
}(window.$$ = window.$$ || {}, jQuery, window, document));
</pre>
Also, read <b>Update</b>.

Issues that was faced:
----------------------
- handling js primitive types
- browser compatibility
- handling circular references
- testing the dreadful 'StyleSheet' object especially with Mozila's number-attributes or even 'document.body' (see http://stackoverflow.com/questions/957537/how-can-i-print-a-javascript-object)
- representing internally a tree as a single array, what I call the 'flattened tree representation' already successfully tested on my bigger projects :)

Update
======
<b>v.0.1</b><br />
<ol>
<li>My namespace moved from <code>$$</code> to <code>g3</code> and so all my projects moved from <code>js&lt;project-name&gt;</code> to <code>g3&lt;project-name&gt;</code> meaning: at global object <code>g3</code> look for member <code>&lt;project-name&gt;</code>, ex.<br />
<ul>
<li><code>g3debug</code> object <code>g3.debug</code></li>
<li><code>g3utils</code> object <code>g3.utils</code></li>
</ul>
</li>
</ol>
<b>v.0.1.1</b><br />
<ol>
<li>Exploits <code>toString()</code> prototype function when encounters <code>Object</code> and <code>Function</code> members: now it prints a message about an object, like <code>[object CSSRuleList]</code> and just the signature of the function's definition.<br />
A mesterious thing that was found was this one: after a second execution of the debuger an error was thrown when a property of a child object was evaluaded in the following block:
<pre>
try{
   value = obj[property];
}catch(e){
   str = [-1, 'Error:', e];
   //new record
   tree.push(str);
   break;
}
</pre>
it was found that when an empty string was added to the results of <code>value.toString()</code> the failed attempts diminish and the source of errors was lower down at the updated block:
<pre>
if(!circular){
   ....
   if(value.toString)
      tmp += value.toString() + '';
   ....
}
</pre>
</li>
<li>
It was corrected an endless for loop that was started when 0 was passed as the 2nd argument. Now, unlimited search happens only at negative numbers or null.
</li>
</ol>
<b>v.0.1.2</b><br />
<ol>
<li>Now, handles any native type (number, boolean, string, date, array), functions and objects of any type native, host or custom.
</li>
<li>A third argument <code>force</code> was added to bypass any boolean result of function <code>g3.utils.isEmptyObject()</code> because it fails on css host objects.
</li>
</ol>

Have fun!

