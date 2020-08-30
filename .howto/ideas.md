Website Ideas
=============

Ideas
-----
* all pages in markdown (`md`)
* client-side and server-side execution using `js`
* modular design with client-side or server-side includes
* include any file type (aka `js`, `css`, `md`, `html`, etc.)
* similar to angular
* using `OOP` stuff:
	* every include contains all the required functionnality (encapsulation)
	* includes have a simplified interface (abstraction)
	* complex includes are built from more simple ones (composition)
	* (polymorphism? - nahhh)
* custom markdown syntax & custom parser?
	* Old parser problems:
		* nesting
		* newlines (fixed if nesting gets fixed)
		* escapes (aka backslashes to escape a character)
	* Solutions: 
		* nesting:
			`{find: /regexStart...regexEnd/, replace: (a, b) => '<a class="${b}">...</a>'}`
				where ... is nesting
		* escapes:
			crappy lastChar variable in the parser? 
	* Actually, start with the rest and then implement a new markdown parser
* 




Server
------
* list of file types to compile the includes / scripts in (aka `md` and `html`)
* server-side or client-side compile? > client-side
* server-side compile / translation & client-side | server-side execution
* code compatible with client-side (since both `js`)
* 











{text: src}
{{img: image}}
{{video: showcase}}
{{video:: video}}
{{obj: file}}


[Google](link "hover")
or
[Google](link (hover2))
[Wikipedia]

[Wikipedia]: link (hover)
or

[Wikipedia]: link "hover"

just wtf...



















