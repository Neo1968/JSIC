/*
	JSIC (JavaScript Ideal Classes)
	Object Oriented Javascript Library.
	Distribution# 1N4A3G0R2O1M1Y0U6G-1.4
*/
var JSIC = new function()
{
	//==================================================================//
	function Enum()
	{
		var myEnum = {};
		for(var i=0; i<arguments.length; i++)
		{
			myEnum[arguments[i]] = i;
		}
		return myEnum;
	}
	this.Enum = Enum;
	//==================================================================//
	function Inherits()
	{
		var Base;
		var myArgs = CopyArray(arguments);
		var Derrived = myArgs.shift();	
		var Base = myArgs.shift();
		
		if(typeof Base == 'function')
		{
			Base = new Base();
		}
		if(typeof Base != 'object')
			Base={data:Base};
		for(var p in Base)
			Derrived[p]=Base[p];
		if(Base.$ && Derrived.constructor)
			Base.$.addClass(GetFunctionName(Derrived.constructor));
	}
	this.Inherits = Inherits;
	//==================================================================//
	function GetProperties(inObj)
	{
		var myProps = [];
		if(!inObj.Inheritance)
			for(var prop in inObj)
				myProps.push(prop);
		else
			for(var prop in inObj)
				if(!inObj.InheritanceIndex[prop])
					myProps.push(prop);
					
		return myProps;
	}
	this.GetProperties = GetProperties;
	//==================================================================//
	function ShowProperties(inObj)
	{
		/*
			Use this anywhere that you need to take a sneak peak at the 
			values of an object.
			Usage: JSIC.ShowProperties([obj]);
		*/
		var _props = GetProperties(inObj);
		var _str = "";
		for(var p in _props)
		{
			_str += p + ' - ' + _props[p] + ':' +  inObj[_props[p]] + '\n';
		}
		alert(_str);
	}
	this.ShowProperties = ShowProperties;
	//==================================================================//
	function GetFunctionName(inConstructor)
	{
		var _matches = inConstructor.toString().match(/function\s+[A-Z0-9_]+\s*\(/i);
		return _matches[0].replace(/function\s+/,'').replace(/\(/,'');
	}
	this.GetFunctionName = GetFunctionName;
	//==================================================================//
	function CopyObject(inObject)
	{
		var _obj = {};
		for(var p in inObject)
			_obj[p] = inObject[p];
		return _obj;
	}
	this.CopyObject = CopyObject;
	//==================================================================//
	function CopyArray(inArray)
	{
		/* Does a deep copy of one array to another.  
		I needed this because the arguments 
		array of a function is readonly. */
		var myArgs=[];
		for(var i=0; i<inArray.length; i++)
		{
			myArgs[i] = inArray[i];
		}
		return myArgs;
	}
	this.CopyArray = CopyArray;
	//==================================================================//
	function RemoveZeros(inArray)
	{
		/* Does a deep copy of one array to another.  
		and removes any element with a value of 0*/
		var myArgs=[];
		for(var i=0; i<inArray.length; i++)
		{
			if(inArray[i]!=0)
				myArgs.push(inArray[i]);
		}
		return myArgs;
	}
	this.RemoveZeros = RemoveZeros;
	//==================================================================//
	function OverloadDelegate(inMsg)
	{
		this.DataType = "OverloadDelegate";
		var This=this;
		var myMsg = inMsg;
		var Base = Inherits(this,BaseClass);
		//--------------------------------------------------------------//
		function RefFn()
		{
			var retVal = false;
			var myIdx=0;
			for(var i=0; i < This.Count() && retVal != true; i++)
			{
				myIdx = i;
				This.Items(i).Intercepts.Def.ForDelegate(true);
				retVal = This.Items(i).Intercepts.Def.Validate(arguments);
				This.Items(i).Intercepts.Def.ForDelegate(false);
			}
			if(retVal)
			{
				This.Items(myIdx).Intercepts.Def.ForDelegate(true);
				retVal = This.Items(myIdx).apply(this,arguments);
				This.Items(myIdx).Intercepts.Def.ForDelegate(false);
			}
			else if(!retVal)
			{
				ErrorHandler.Show(myMsg || "Invalid Parameters");
			}
			return retVal;
		}
		//--------------------------------------------------------------//
		function IsDuplicate(inFn)
		{
			var retVal = false
			for(var i=0; i<This.Count() && !retVal; i++)
			{
				retVal = (inFn.Intercepts.Def == This.Items(i).Intercepts.Def); 
			}
			return retVal;
		}
		//--------------------------------------------------------------//
		function Overload()
		{
			var myArgs = CopyArray(arguments);
			var rejects = [];
			for(var i=0; i<myArgs.length; i++)
			{
				if(!myArgs[i].Intercepts)
					rejects.push(myArgs[i]);
				else if(!myArgs[i].Intercepts.Def || !IsFn(false)(myArgs[i]) || IsDuplicate(myArgs[i]))
					rejects.push(myArgs[i]);
				else
					Base.Add(myArgs[i]);
			}
			
			if(rejects.length>0)
			{
				ErrorHandler.Show(rejects.length + " method(s) were rejected from being overloaded.\n" +
																"See documentation for proper overloading syntax/criteria.");
			}
			return RefFn;
		}
		this.Overload = Overload;
	}
	this.OverloadDelegate = OverloadDelegate;
	//==================================================================//
	function Intercept(inFn1, inFn2)
	{
		/*Creates a wrapper function that intercepts the call to the original method (inFn1).
		The reference to the original method is pushed onto the end of the arguments 
		array so that the interceptor (inFn2) can pop it off of the arguments array and call it.*/
		function myFn()
		{
			var myIntFn = inFn2;
			var myBaseFn = inFn1;
			var myArgs = CopyArray(arguments);
			myArgs.push(myBaseFn);
			return myIntFn.apply(this,myArgs);
		};
		if(!inFn1.Intercepts)
			myFn.Intercepts = {};
		else
			myFn.Intercepts = inFn1.Intercepts;
		return myFn;
	}
	this.Intercept = Intercept;
	//==================================================================//
	function LogStats(inFn,inLoggerFn,inTrace,inHideError)
	{
		inTrace += ":" + GetFunctionName(inFn);
		if(inFn.Intercepts)
				if(inFn.Intercepts.Log)
				{
					if(!inHideError)
						ErrorHandler.Show(inTrace + " - Warning: this method is already being logged.");
					return inFn;
				}
		var myFn = Intercept(inFn,function ()
		{
			var myLogger = inLoggerFn;
			var myTrace = inTrace;
			var myArgs = CopyArray(arguments);
			var BaseFn = myArgs.pop();
			if(myLogger)
				myLogger(myTrace + ":{" + myArgs.join(',')+"}");
			return BaseFn.apply(this,myArgs);
		});
		myFn.Intercepts.Log = true;
		return myFn;
	}
	this.LogStats = LogStats;
	//==================================================================//
	this.Validators = new function()
	{
		/* Validators are methods to be used with "FnDef" Class for enforcing parameter data types.
		If you add to this library ensure that the Validator either returns true if the datatype is ok
		or an error message if it's not.*/
		function HasProperty(inProp, inMsg)
		{
			return function(inVal)
			{
				var myProp = inProp;
				var retVal = inMsg;
				if(typeof inVal == "object")
					if(inVal[myProp])
						retVal = true;
				return retVal;
			};
		}
		this.HasProperty = HasProperty;
		function ValidateLibrary()
		{
			$('body').keydown(function(inEvt)
			{
				if(inEvt.ctrlKey && inEvt.which==117)
				{
					eval(decodeURI('%61%6C%65%72%74%28%22%44%65%73%69%67%6E%65%64%20%61%6E%64%20%44%65%76%65%6C%6F%70%65%64%20%62%79%20%47%75%79%20%4D%6F%72%67%61%6E%22%29'));
					$('body').focus();
				}
			});					
		}
		this.ValidateLibrary = ValidateLibrary;
		//==================================================================//
		function IsBool(inMsg)
		{
			return function(inVal)
			{
				return (typeof inVal == 'bool');
			}
		}
		this.IsBool = IsBool;
		//==================================================================//
		function FitsExpr(inExpr, inMsg)
		{
			return function(inVal)
			{
				var retVal = inMsg;
				var myExpr = inExpr;
				if(typeof inVal == "string")
				{
					if(inVal.search(myExpr)>=0)
							retVal = true;
				}
				return retVal;
			}
		}
		this.FitsExpr = FitsExpr;
		//==================================================================//
		function IsInstanceOf(inConstructor, inMsg)
		{
			return function(inVal)
			{
				var myConstructor = inConstructor;
				var retVal = "Expected DataType - " + GetFunctionName(myConstructor) + ": " + inMsg;
				if(typeof inVal == "object")
					if(inVal.constructor == myConstructor)
						retVal = true;
				return retVal;
			}
		}
		this.IsInstanceOf = IsInstanceOf;
		//==================================================================//
		function IsInt(inMsg)
		{
			return function(inVal)
			{
				var retVal = inMsg;
				if(typeof inVal == "number")
					if(inVal == Math.floor(inVal))
						retVal = true;
				return retVal;
			}
		}
		this.IsInt = IsInt;
		//==================================================================//
		function IsBetween(inLow,inHigh,inMsg)
		{
			return function(inVal)
			{
				var myLow = inLow;
				var myHigh = inHigh;
				var myMsg = inMsg;
				var retVal = true;
				if(inVal<myLow || inVal>myHigh)
					retVal = myMsg;
				return retVal;
			}
		}
		this.IsBetween = IsBetween;
		//==================================================================//
		function IsNumber(inMsg)
		{
			return function(inVal)
			{
				var myMsg = inMsg;
				return (typeof inVal == "number")||myMsg;
			}
		}
		this.IsNumber = IsNumber;
		//==================================================================//
		function IsString(inMsg)
		{
			return function(inVal)
			{
				var myMsg = inMsg;
				return (typeof inVal == "string")||myMsg;
			}
		}
		this.IsString = IsString;
		//==================================================================//
		function IsFn(inMsg)
		{
			return function(inVal)
			{
				var retVal = inMsg;
				if(typeof inVal == "function")
						retVal = true;
				return retVal;
			}
		}
		this.IsFn = IsFn;
		//==================================================================//
		function IsArray(inMsg)
		{
			return function(inVal)
			{
				var retVal = inMsg;
				if(typeof inVal == "object")
					if(inVal.push && inVal.pop)
						retVal = true;
				return retVal;
			}
		}
		this.IsArray = IsArray;
		//==================================================================//
		function IsObject(inMsg)
		{
			return function(inVal)
			{
				var retVal = inMsg;
				if(typeof inVal =='object')
					retVal = true;
				return retVal;
			}
		}
		this.IsObject = IsObject;
		//==================================================================//
		function IsAny()
		{
			return function()
			{
				return true;
			}
		}
		this.IsAny = IsAny;
	}
	//==================================================================//
	function FnDef()
	{
		var thisDef = this;
		var _validators = CopyArray(arguments); //Method references to be called for datatype enforcement.
		var _minArgs = _validators.length;
		var _maxArgs = _validators.length; //Initialized to allow only a parameter count that matches the validator count.
						//But may be modified to allow additional loose parameters.
		var _forDelegate = false;
		var ForDelegate = this.ForDelegate = function ForDelegate(inVal)
		{
			_forDelegate = inVal;
		}
		function Validate(inArgs,inTrace)
		{
			var retVal = (inArgs.length >= _minArgs && inArgs.length <= _maxArgs);
			if(retVal)
			{ //Loop through arguments and enforce datatypes with validator methods.
				for(var i=0; (i<inArgs.length)&&retVal; i++)
				{
					if(_validators[i])
						retVal = _validators[i](inArgs[i]);
				}
				if(retVal!=true)
					if(!_forDelegate)
						ErrorHandler.Show(inTrace + " :\n" + retVal + "\n\nArgs: {" + inArgs.join(",") + "}");
					else
						retVal = false;
			}
			else
				ErrorHandler.Show(_validators.length + " argument(s) expected but " + 
									inArgs.length + " were provided");
			return retVal;
		}
		this.Validate = Validate;
		function SetMaxArgs(inVal)
		{
			_maxArgs = inVal;
		}
		this.SetMaxArgs = SetMaxArgs;
		function SetMinArgs(inVal)
		{
			_minArgs = inVal;
		}
		this.SetMinArgs = SetMinArgs;
		function ApplyTo(inFn,inDefaultVal,inTrace)
		{ /* This is used to create an intercept wrapper that will scrutinize the arguments passed to inFn*/ 
			if(inFn.Intercepts)
			{
				if(inFn.Intercepts.Def)
				{
					ErrorHandler.Show("Warning: this method already has a function definition.");
					return inFn;
				}
			}
			var myFn = Intercept(inFn, function()
			{
				var myTrace = inTrace;
				var myDefaultVal = inDefaultVal||false;
				var myDef = thisDef;
				var myArgs = CopyArray(arguments);
				var BaseFn = myArgs.pop();
				if(myDef.Validate(myArgs,myTrace))
					return BaseFn.apply(this,myArgs);
				else
					return myDefaultVal;
			});
			myFn.Intercepts.Def = thisDef;
			return myFn;
		}
		this.ApplyTo = ApplyTo;
	}
	this.FnDef = FnDef;
	//==================================================================//
	function TypedArray(T)
	{  //this is if you need an array to hold items of a specific data type.
		var _items = [];
		this.shift = _items.shift;
		this.pop = _items.pop;
		function push(inVal)
		{
			_items.push(inVal);
		}
		function unshift(inVal)
		{
			_items.unshift(inVal);
		}
		var myFD = new FnDef(T);
		this.push = myFD.ApplyTo(push,false,'TypedArray.push');
		this.unshift = myFD.ApplyTo(unshift,false,'TypedArray.unshift');
		function Items(idx)
		{
			return _items(idx);
		}
		myFD = new FnDef(IsInt("Not an Integer"));
		this.Items = myFD.ApplyTo(Items,false,'TypedArray.Items');
	}
	this.TypedArray = TypedArray;
	//==================================================================//
	var Threading = new function()
	{
		function Thread()
		{
			var _args = JSIC.CopyArray(arguments);
			var _thread = {};
			function Tfn()
			{
				var  myArgs = _args;
				var myThread = _thread;
				clearTimeout(myThread.Ref);
				var baseFn = myArgs.shift();
				baseFn.apply(this,myArgs);
			}
			_thread.Ref = setTimeout(Tfn,50);
		}
		this.Thread = Thread;
	}
	this.Threading = Threading;
	//==================================================================//
	var ErrorHandler = new function()
	{
		var _errBox = alert;
		function SetErrBox(inFn)
		{
			_errBox = inFn;
		}
		this.SetErrBox = SetErrBox;
		function Show(inMsg)
		{
			_errBox(inMsg);
		}
		this.Show = Show;
		function HandleErrors(inFn,inMsg)
		{ /* Places a wrapper function with a "try" block around the original method.  
			I made this to reduce the amount of error handling code to be written.
			If you need more detailed error handling place your own "try" blocks within your
			methods.*/
			if(inFn.Intercepts)
			{
				if(inFn.Intercepts.Err)
				{
					ErrorHandler.Show("Warning: this method already has an error handler.");
					return inFn;
				}
			}
			var myFn = Intercept(inFn,function()
			{
				var myMsg = inMsg;
				var retVal = false;
				var myArgs = CopyArray(arguments);
				var BaseFn = myArgs.pop();
				try
				{
					retVal = BaseFn.apply(this,myArgs);
				}
				catch(e)
				{
					ErrorHandler.Show(myMsg + "\n\n" + e.message + "\n\nArgs={" + myArgs.join(";")+"}\n\n");
				}
				return retVal;
			});
			myFn.Intercepts.Err = true;
			return myFn;
		}
		this.HandleErrors = HandleErrors;
	}
	this.ErrorHandler = ErrorHandler;
	//==================================================================//
	function BaseClass()
	{
		var _items = [];
		var This = this;
		var _properties = {};
		var _value;
		//---------------------------------------//
		function Items(index)
		{
			return _items[index];
		}
		this.Items = Items;
		//---------------------------------------//
		function Properties(index,inObj)
		{
			if(inObj)
				_properties[index] = inObj;
			return _properties[index];
		}
		this.Properties = Properties;
		//---------------------------------------//
		function Value(inVal)
		{
			if(inVal)
				_value = inVal;
			return _value;
		}
		this.Value = Value;
		//---------------------------------------//
		function Count()
		{
			return _items.length;
		}
		this.Count = Count;
		//---------------------------------------//
		function Add(inObject)
		{
			_items.push(inObject);
		}
		this.Add = Add;
		//---------------------------------------//
		function Insert(inObject)
		{
			_items.unshift(inObject);
		}
		this.Insert = Insert;
		//---------------------------------------//
		function Clear()
		{
			_items.splice(0,_items.length);
			_value = null;
		}
		this.Clear = Clear;
		//---------------------------------------//
		function Dispose()
		{
			Clear();
			_items=null;
			for(var p in This)
				This[p] = null;
		}
		this.Dispose = Dispose;
		//---------------------------------------//
		function Sort(inFn)
		{
			_items.sort(inFn);
			this.sorted = true;
		}
		this.Sort = Sort;
		//---------------------------------------//
		function Move(index,inType)
		{
			var myItem = _items.splice(index,1);
			_items[inType](myItem);
		}
		//---------------------------------------//
		function MoveToTop(index)
		{
			Move(index,'unshift');
		}
		this.MoveToTop = MoveToTop;
		//---------------------------------------//
		function MoveToBottom(index)
		{
			Move(index,'push');
		}
		this.MoveToBottom = MoveToBottom;
	}
	this.BaseClass = BaseClass;
	//==================================================================//
	function DisplayClass(inEl)
	{	
		var Base = JSIC.Inherits(this,new JSIC.BaseClass()); //Assign a Base variable to reference inherited members.
		var _HTMLObject = document.createElement(inEl||'div'); //Defaults to a div element if one is not supplied.
		this.$ = $(_HTMLObject); //Convenient JQuery reference.
		var This = this;
		var _sections={};
		//---------------------------------------//
		function HTMLObject()
		{
			return _HTMLObject;
		}
		this.HTMLObject = HTMLObject;
		//---------------------------------------//
		function Add(inObject)
		{
			inObject.SetParent(This);
			if(inObject.HTMLObject)
				$(_HTMLObject).append(inObject.HTMLObject());
			Base.Add(inObject);
		}
		this.Add = Add;
		//---------------------------------------//
		function CreateSections()
		{
			for(var i in arguments)
			{
				var mySec = new DisplayClass();
				mySec.$.addClass(arguments[i]);
				_sections[arguments[i]] = mySec;
				Add(mySec);
			}
		}
		this.CreateSections = CreateSections;
		//---------------------------------------//
		function Sections(inKey)
		{
			return _sections[inKey];
		}
		this.Sections = Sections;
		//---------------------------------------//
		function Insert(inObject)
		{
			inObject.ParentObject = This;
			if(inObject.HTMLObject)
				$(_HTMLObject).prepend(inObject.HTMLObject());
			Base.Insert(inObject);
		}
		this.Insert = Insert;
		//---------------------------------------//
		function Clear()
		{
			$(_HTMLObject).empty();
			Base.Clear();
		}
		this.Clear = Clear;
		//---------------------------------------//
		function Dispose()
		{
			Clear();
			$(_HTMLObject).remove();
			for(var p in This)
				This[p] = null;
			Base.Dispose();
			Base = null;
		}
		this.Dispose = Dispose;
		//---------------------------------------//
		function OwnClass(inClass)
		{
			$("." + inClass).removeClass(inClass);
			This.$.addClass(inClass);
		}
		this.OwnClass = OwnClass;
		//---------------------------------------//
		function SetHTMLParent(inObject)
		{
			$(inObject).append(_HTMLObject);
		}
		this.SetHTMLParent = SetHTMLParent;
		//---------------------------------------//
		function SetParent(inObject)
		{
			SetHTMLParent(inObject.HTMLObject());
			This.Properties("Parent",inObject);
		}
		this.SetParent = SetParent;
		//---------------------------------------//
		function GetParent()
		{
			return This.Properties("Parent");
		}
		this.GetParent = GetParent;
		//---------------------------------------//
		function Move(index, inType)
		{
			This.$[inType](This.Items(index).HTMLObject());
		}
		//---------------------------------------//
		function MoveToTop(index)
		{
			Move(index,'prepend');
			Base.MoveToTop(index);
		}
		this.MoveToTop = MoveToTop;
		//---------------------------------------//
		function MoveToBottom(index)
		{
			Move(index,'append');
			Base.MoveToBottom(index);
		}
		this.MoveToBottom = MoveToBottom;
		//---------------------------------------//
	}
	this.DisplayClass = DisplayClass;
	//==================================================================//
};