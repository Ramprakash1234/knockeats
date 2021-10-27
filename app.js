let express		= require("express"),
	app			= express(),
	mongoose	= require("mongoose"),
	bcrypt	 	= require("bcryptjs"),
	bodyparser	= require("body-parser"),
	sessions	= require("client-sessions"),
	nodemailer	= require('nodemailer'),
	quotes		= [{
			quote:"The only thing I like better than talking about food is eating",
			by:"John Walters"},
		   {
			quote:"You need a serious consultation, if you do not think of dinner when having your lunch",
			by:"Ramprakash"},
			{
			quote:"One cannot think well,love well, sleep well, if one 	has not dinned well",
			by:"Virginia woolf"},
			{
			quote:"You don't need a silver fork to eat good food",
			by:"Paul prudhomme"},
			{
			quote:"You have understood the importance of life, if you 	prioritize eating over everything",
			by:"Ramprakash"},
			{
			quote:"People who love to eat are always the best people",
			by:"Julia child"}
		   ],
	username="srp";

app.set("view engine","ejs");

//=======================================================================
//==========================Database====================================
//=======================================================================

mongoose.set('useNewUrlParser',true);
mongoose.set('useUnifiedTopology',true);
mongoose.set('useFindAndModify',false);

//mongoose.connect("mongodb://localhost/knockeats");
mongoose.connect("mongodb+srv://Ramprakash:KFHfN5EapMZp3Xnp@cluster0.ocdtt.mongodb.net/knockeats?retryWrites=true&w=majority");
let cusauthschema=new mongoose.Schema({
	username:String,
	password:String
},{collection:"cusauth"});
let cusauth=mongoose.model("cusauth",cusauthschema);

let resauthschema=new mongoose.Schema({
	username:String,
	password:String
},{collection:"resauth"});
let resauth=mongoose.model("resauth",resauthschema);

let ordersSchema=new mongoose.Schema({
						cusername:String,
						/*rusername:String,*/
						orderdate:Date,
						tocontact:Number,
						toaddress:String,
						orderdetails:[],//rusername inside orderdetails
						totalamount:Number,
						paymentmode:String,
						orderstatus:String,//pass the order det into customers collection too
},{collection:"orders"});

let orders=mongoose.model("orders",ordersSchema);

let resordersSchema=new mongoose.Schema({
						cusername:String,
						rusername:String,
						orderdate:Date,
						tocontact:Number,
						toaddress:String,
						orderdetails:[],//rusername inside orderdetails
						totalamount:Number,
						paymentmode:String,
						orderstatus:String,//pass the order det into customers collection too
},{collection:"resorders"});

let resorders=mongoose.model("resorders",resordersSchema);

let resDetSchema=new mongoose.Schema({
						restaurantUsername:String,/*unique*/
						restaurantName:String,
						restaurantImage:String,
						orders:[{
								type:mongoose.Schema.Types.ObjectId,
			    				ref:"resorders"//model name to refer	
							}],
						restaurantTiming:String,
						restaurantLocation:String,
						restaurantPhone:String
},{collection:"restaurantDetails"});

let restaurantDetails=mongoose.model("restaurantDetails",resDetSchema);

let customersSchema=new mongoose.Schema({
						cusername:String,
						address:{},
						phone:String,
						displayname:String,
						orders:[
							{
								type:mongoose.Schema.Types.ObjectId,
			    				ref:"orders"//model name to refer	
							}],
},{collection:"customers"});

let customers=mongoose.model("customers",customersSchema);

let catalogSchema=new mongoose.Schema({
						restaurantUsername:String,
						itemName:String,
						itemDescription:String,
						itemImage:String,
						itemPrice:Number,
						category:String,
						itemNutrition:{},
},{collection:"catalog"});

let catalog=mongoose.model("catalog",catalogSchema);

let blogschema=new mongoose.Schema({
	username:String,
	title:String,
	image:String,
	description:String,
	dateofpublish:Date,
	comments:[{
					type:mongoose.Schema.Types.ObjectId,
			    	ref:"commenttbl"//model name to refer	
				}]
},{collection:blogtbl});
var blogtbl=mongoose.model("blogtbl",blogschema);

let commentsSchema=new mongoose.Schema({
	username:String,
	comment:String,
});
var commenttbl=mongoose.model("commenttbl",commentsSchema);

//=======================================================================
//===========================Middleware==================================
//=======================================================================

app.use(express.static("public"));
app.use(bodyparser.urlencoded({extended: true}));
app.use(sessions({
		cookieName: 'cartsession',
		secret: 'kjkni3dsads3das2',
		duration: 5*60*1000,
		ephermeral:true, //destroy cookies when browser is closed
		secure:true,     //only set cookies over https
		httpOnly:false 	 //let js code to access cookies
}));
app.use(sessions({
		cookieName: 'loggedinsession',
		secret: 'q5f2t54hskmorbm85dbjl',
		duration: 5*60*1000,
		ephermeral:true, //destroy cookies when browser is closed
		secure:true,     //only set cookies over https
		httpOnly:false, 
}));
app.use(sessions({
		cookieName: 'otpsession',
		secret: 'kjkni3dsads3das2',
		duration: 5*60*1000,
		ephermeral:true, //destroy cookies when browser is closed
		secure:true,     //only set cookies over https
		httpOnly:false 	 //let js code to access cookies
}));
app.use(sessions({
		cookieName: 'statussession',
		secret: 'kjkni3dsads3das2',
		duration: 5*60*1000,
		ephermeral:true, //destroy cookies when browser is closed
		secure:true,     //only set cookies over https
		httpOnly:false 	 //let js code to access cookies
}));



let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service : 'Gmail',
    auth:{
      user: 'knockeats@gmail.com',
      pass: '********',
    }
});

//======================================================================
//===============================ROUTES=================================
//======================================================================

app.post("/Login",function(req,res){
	let status;
	if(req.body.typeofuser=="Restaurant"){
		resauth.findOne({username:req.body.username},function(err,rest){
			if(rest && bcrypt.compareSync(req.body.password,rest.password)){
				status="success";
				req.loggedinsession.username=req.body.username;
				req.loggedinsession.usertype="restaurant";
				req.statussession.status="Successfully logged in!";
				req.statussession.isstatus=true;
				res.redirect("/home");
				console.log(status);
			}else if(rest){
				status="Wrong passkey";
				console.log(status);
				req.statussession.status="Wrong passkey";
				req.statussession.isstatus=true;
				res.redirect("/Login");
			}else{
				status="No user found";	
				console.log(status);
				req.statussession.status="No user found!";
				req.statussession.isstatus=true;
				res.redirect("/Login");
			}
		});
	}else{
		cusauth.findOne({username:req.body.username},function(err,cus){
			if(cus && bcrypt.compareSync(req.body.password,cus.password)){
				status="success";
				req.loggedinsession.username=req.body.username;
				req.loggedinsession.usertype="customer";
				console.log(status);
				req.statussession.status="Successfully Logged In";
				req.statussession.isstatus=true;
				res.redirect("/home");
			}else if(cus){
				status="Wrong passkey";
				console.log(status);
				req.statussession.status="Wrong passkey";
				req.statussession.isstatus=true;
				res.redirect("/Login");
			}else{
				status="No user found";	
				console.log(status);
				req.statussession.status="No user found";
				req.statussession.isstatus=true;
				res.redirect("/Login");
			}
		});
	}
});

app.get("/resregister",function(req,res){
	res.render("resregister");
});
app.post("/resregister",function(req,res){
	resauth.findOne({username:req.body.username},function(err,rest){
		if(rest){
			req.statussession.isstatus=true;
		req.statussession.status="Account already exists!Login here";
			res.redirect("/Login");
		}else{
			let cryptedpass=bcrypt.hashSync(req.body.password,14);
resauth.create({username:req.body.username,password:cryptedpass},function(err,createdresauth){
	restaurantDetails.create({
						restaurantUsername:createdresauth.username,
						restaurantName:req.body.hotelname,
						//restaurantImage:String,
						orders:[],
						restaurantTiming:req.body.restiming,
						restaurantLocation:req.body.reslocation,
						restaurantPhone:req.body.resphone,
						},function(err,createdresdetails){
			req.loggedinsession.username=createdresdetails.username;
			req.loggedinsession.usertype="restaurant";
			req.statussession.isstatus=true;
			req.statussession.status="Account created successfully!";
			res.redirect("/home");
	});
});	
		}
	});	
});
app.get("/cusregister",function(req,res){
	res.render("cusregister");
});
app.post("/cusregister",function(req,res){
	cusauth.findOne({username:req.body.username},function(err,rest){
		if(rest){
			req.statussession.isstatus=true;
		req.statussession.status="Account already exists!Login here";
			res.redirect("/Login");
		}else{
			let cryptedpass=bcrypt.hashSync(req.body.password,14);
cusauth.create({username:req.body.username,password:cryptedpass},function(err,createdcusauth){
	customers.create({
						cusername:createdcusauth.username,
						address:{'home':req.body.address},
						phone:req.body.phone,
						displayname:req.body.displayname,
						orders:[],
						},function(err,createdcusdetails){
			req.loggedinsession.username=createdcusdetails.cusername;
			req.loggedinsession.usertype="customer";
			req.statussession.isstatus=true;
			req.statussession.status="Account created successfully!";
			res.redirect("/home");
	});
});	
		}
	});	
});
app.get('/cartdetails',iscusloggedin,function(req,res){
	console.log(req.cartsession.cart);
	//console.log(req.cartsession.cart);
		if(typeof(req.cartsession.cart)!='undefined'){
			if(req.cartsession.cart.length==0){
				return res.render("mycart",{cartstring:'empty',loggedinusername:req.loggedinsession});
			}else{
				req.cartsession.totalamount=0;
			for(var i=0;i<req.cartsession.cart.length;i++){
				if(req.cartsession.cart[i].iQuantity==0){
					req.cartsession.cart.splice(i,1);
				}
			}
			for(var i=0;i<req.cartsession.cart.length;i++){
		req.cartsession.totalamount+=req.cartsession.cart[i].iValue;
			}
customers.findOne({cusername:req.loggedinsession.username},function(err,customer){
				 return res.render("mycart",{cartstring:JSON.stringify(req.cartsession.cart),totalamount:req.cartsession.totalamount,customer:customer,loggedinusername:req.loggedinsession});
			});
			}
		}
	else{
		return res.render("mycart",{cartstring:'empty',loggedinusername:req.loggedinsession});	
	}
});

app.post('/updateCart',iscusloggedin,function(req,res){
if(req.body.purpose=="insert"){
	var itemValue=Number(req.body.itemquantity)*Number(req.body.itemvalue);
	if(typeof(req.cartsession.cart)=='undefined' || req.cartsession.cart.length==0){
		req.cartsession.cart=[];
		req.cartsession.cart.push(
				 {
					 iName:req.body.itemName,
							   iQuantity:Number(req.body.itemquantity),
iImage:req.body.itemimage,									   iSingleValue:Number(req.body.itemvalue),
iRestaurantName:req.body.hotelname,
iRestaurantUsername:req.body.hotelusername,									   
									   iValue:itemValue});
			return res.redirect("back");
	}else{
		for(var i=0;i<req.cartsession.cart.length;i++){
			if(req.cartsession.cart[i].iName===req.body.itemName && req.cartsession.cart[i].iRestaurantUsername===req.body.hotelusername){
				req.cartsession.cart[i].iQuantity=Number(req.body.itemquantity);
				req.cartsession.cart[i].iSingleValue=Number(req.body.itemvalue);
				req.cartsession.cart[i].iValue=itemValue;
				res.redirect("back");
				break;
			}
			else if(i==(req.cartsession.cart.length)-1){
				req.cartsession.cart.push(
									  {iName:req.body.itemName,
									   iQuantity:Number(req.body.itemquantity),
iImage:req.body.itemimage,
		iSingleValue:Number(req.body.itemvalue),	   iRestaurantName:req.body.hotelname,
iRestaurantUsername:req.body.hotelusername,
									   iValue:itemValue});
				res.redirect("back");
			}
		}
	}	
}else if(req.body.purpose=='remove'){
		for(var i=0;i<req.cartsession.cart.length;i++){
				if(req.cartsession.cart[i].iName==req.body.itemName){
					req.cartsession.cart.splice(i,1);
				}
		}
	res.redirect("/cartdetails");	
}		
});

app.get("/home",function(req,res){
	//req.mysession.id.shift();
	//req.cartsession.cart=[];
	if(req.statussession.isstatus){
		req.statussession.isstatus=false;
	}else{
		req.statussession.isstatus=false;
		req.statussession.status="";
	}
	res.render("home",{quotes:quotes,loggedinusername:req.loggedinsession,status:req.statussession.status});
});

app.get("/Login",function(req,res){
	if(req.statussession.isstatus){
		req.statussession.isstatus=false;
	}else{
		req.statussession.isstatus=false;
		req.statussession.status="";
	}
	res.render("Login",{status:req.statussession.status});	
});
//****************************************
//			  Placeorder(POST)
//****************************************
app.get("/res",isresloggedin,function(req,res){
	if(req.statussession.isstatus){
		req.statussession.isstatus=false;
	}else{
		req.statussession.isstatus=false;
		req.statussession.status="";
	}
restaurantDetails.findOne({restaurantUsername:req.loggedinsession.username},function(err,rdet)	{
catalog.find({restaurantUsername:rdet.restaurantUsername},function(err,catalog){
			res.render("resPage",{catalog:catalog,rdet:rdet,loggedinusername:req.loggedinsession,status:req.statussession.status});			 
		});					
	});
});
//****************************************
//		  res item add page(get)
//****************************************
app.get("/res/itemadd",isresloggedin,function(req,res){
	
	res.render("itemadd",{loggedinusername:req.loggedinsession});
});
//****************************************
//	    item add in res catalog(POST)
//****************************************
app.post("/res/itemadd",isresloggedin,function(req,res){
	let nutritions={};
	if(typeof req.body.nutritiontypes=="string")
			{
		nutritions[req.body.nutritiontypes]=req.body.nutritionvalues;
			}
	else if(typeof req.body.nutritiontypes=="object")
	{
		for(var i=0;i<req.body.nutritiontypes.length;i++)
		{
			if(req.body.nutritionvalues[i]!="0" && req.body.nutritionvalues[i]!="")
			{
	nutritions[req.body.nutritiontypes[i]]=req.body.nutritionvalues[i];
			}
		}
	}
	catalog.create({
					restaurantUsername:req.loggedinsession.username,
					itemName:req.body.itemname,
					itemDescription:req.body.itemdescription,
					itemImage:req.body.itemimage,
					itemPrice:req.body.itemprice,
					category:req.body.itemcategory,
					itemNutrition:nutritions
	},function(err,addedcatalog){
		if(!err){
			req.statussession.status="Item added successfully";
			req.statussession.isstatus=true;
			res.redirect("/res");	
		}
	}); 
});
//****************************************
//			  All res page(POST)
//****************************************
app.post("/allresdetails",function(req,res){
	//res.send("search result for"+ req.body.location);
	if(typeof req.cartsession.cart=="undefined"){
		req.cartsession.cart=[];
	}
	let location=(req.body.location).toLowerCase();
	restaurantDetails.find({restaurantLocation:location},function(err,restaurants)	{
		//res.send(restaurants[0].restaurantName);
		res.render('allrestaurants',{restaurants:restaurants,loggedinusername:req.loggedinsession,location:location});
	});
});
//****************************************
//			  Singleres page(GET)
//****************************************
app.get("/singleresdetails/:id",function(req,res){
	//res.send("welcome to"+req.params.id);
	restaurantDetails.findById(req.params.id,function(err,restaurant){
catalog.find({restaurantUsername:restaurant.restaurantUsername},function(err,sinrescatalog){
	var categories=[];
	for(var i=0;i<sinrescatalog.length;i++){
		if((sinrescatalog[i].category.length!=0) && (categories.indexOf(sinrescatalog[i].category.toLowerCase())==-1)){
			categories.push(sinrescatalog[i].category.toLowerCase());
		}
	}
resorders.find({rusername:restaurant.restaurantUsername},function(err,resorder){
	//console.log(resorders[0].orderdate.substring(4,15));
	res.render("singleresdetails",{restaurant:restaurant,catalog:sinrescatalog,cartstring:req.cartsession.cart,resorder:resorder,loggedinusername:req.loggedinsession,categories:categories});	
	});
	
		});
	});
});
//****************************************
//			  Placeorder(POST)
//****************************************
app.post("/placeorder",iscusloggedin,function(req,res){
	orders.create({
					cusername:req.loggedinsession.username,
					orderdate:new Date(),
				   	tocontact:req.body.phone,
					toaddress:req.body.address,
					orderdetails:req.cartsession.cart,//rusername inside orderdetails
					totalamount:Number(req.cartsession.totalamount),
					paymentmode:'Cash On Delivery',
					orderstatus:'Placed',
	},function(err,order){
customers.findOne({cusername:req.loggedinsession.username},function(err,customer){
			customer.orders.push(order);
			customer.save();
			var mailOptions={
    				to:req.loggedinsession.username,
        			subject: "Order placed via Knockeats",
        html: "<p></p><h3 style='margin-top:15px;'>Greetings from Ramprakash.</h3><p>Hi "+customer.displayname+",You have placed your order successfully! View your customer portal to know more about the order details.</p><h5>Bon appetit!</h5><h3>Thanks for using knockeats</h3>"
    		};
			transporter.sendMail(mailOptions, function(err, info){
        		if (err) {
            		return console.log(err);
        }
        console.log('Message sent:'+info.messageId);   
        console.log('Preview URL:'+nodemailer.getTestMessageUrl(info));
        res.redirect('/register');
    		});	
		});
		req.statussession.isstatus=true;
		req.statussession.status="Order placed successfully!";
		res.redirect("/cus/ordersummary");
	});
	let diffRes=[];
	for(var i=0;i<req.cartsession.cart.length;i++){
		isavailable=false;
		for(var j=0;j<diffRes.length;j++){
		if(diffRes[j].username==req.cartsession.cart[i].iRestaurantUsername){
				isavailable=true;
			}
		}
		if(isavailable==false){
diffRes.push({username:req.cartsession.cart[i].iRestaurantUsername,orders:[]});
		}
	}
	for(var noofres=0;noofres<diffRes.length;noofres++){
		totalvalue=0;
		for(var j=0;j<req.cartsession.cart.length;j++){
if(diffRes[noofres].username==req.cartsession.cart[j].iRestaurantUsername){
	totalvalue+=req.cartsession.cart[j].iValue;
	diffRes[noofres].orders.push(req.cartsession.cart[j]);			
  }
		}
		diffRes[noofres].totalamount=totalvalue;
		resorders.create({
						cusername:req.loggedinsession.username,
						rusername:diffRes[noofres].username,
						orderdate:new Date(),
						tocontact:req.body.phone,
						toaddress:req.body.address,
						orderdetails:diffRes[noofres].orders,
						totalamount:diffRes[noofres].totalamount,
						paymentmode:'COD',
						orderstatus:'Placed',							
		},function(err,resorders){		restaurantDetails.findOne({'restaurantUsername':resorders.rusername},function(err,rest){
			rest.orders.push(resorders);
			rest.save();
			var mailOptions={
    				to:rest.restaurantUsername,
        			subject: "Order placed via Knockeats",
        html: "<p></p><h3 style='margin-top:15px;'>Greetings from Ramprakash.</h3><p>Hi "+rest.restaurantName+",</p><p>You have a new order. Login to your restaurant portal to know more.</p><h3>Thanks for tieing up with knockeats.</h3>"
    		};
			transporter.sendMail(mailOptions, function(err, info){
        		if (err) {
            		return console.log(err);
        }
        console.log('Message sent:'+info.messageId);   
        console.log('Preview URL:'+nodemailer.getTestMessageUrl(info));
        res.redirect('/register');
    		});
			
		});
			//console.log('Order summary'+resorders);
		});
	}
});
//****************************************
//			    View orders
//****************************************
app.get("/cus/ordersummary",iscusloggedin,function(req,res){
	if(req.statussession.isstatus){
		req.statussession.isstatus=false;
	}else{
		req.statussession.isstatus=false;
		req.statussession.status="";
	}
customers.findOne({cusername:req.loggedinsession.username}).populate("orders").exec(function(err,customer){
			res.render("customerordersummary",{customer:customer,loggedinusername:req.loggedinsession,status:req.statussession.status});
		});
});

app.get("/res/ordersummary",isresloggedin,function(req,res){
resorders.find({rusername:req.loggedinsession.username},function(err,restaurant){
			res.render("restuarantordersummary",{restaurant:restaurant,loggedinusername:req.loggedinsession});
		//res.send(restaurant);
			});
	
});
app.get("/blogs",function(req,res){
	if(req.statussession.isstatus){
		req.statussession.isstatus=false;
	}else{
		req.statussession.isstatus=false;
		req.statussession.status="";
	}
	blogtbl.find({},function(err,blogs){
		res.render("allblogs",{blogs:blogs,loggedinusername:req.loggedinsession,status:req.statussession.status});
	});
});

app.get("/blogs/new/",iscusloggedin,function(req,res){
	res.render("newblogform",{loggedinusername:req.loggedinsession});
});

app.post("/blogs/create",iscusloggedin,function(req,res){
	blogtbl.create({
		username:req.loggedinsession.username,
		dateofpublish:Date(),
		title:req.body.title,
		image:req.body.image,
		description:req.body.description},function(err,blogs){
		if(!err){
			req.statussession.isstatus=true;
			req.statussession.status="Blog added successfully!";
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/edit/:id",iscusloggedin,function(req,res){
	var id=req.params.id;
	blogtbl.findById(id,function(err,blog){
		if(!err){
			if(blog.username==req.loggedinsession.username){
				return res.render("singleblogeditpage",{blog:blog,loggedinusername:req.loggedinsession});	
			}else{
				res.redirect("/blogs");
			}
		}
	});	
});

app.get("/blogs/:id",function(req,res){	blogtbl.findById(req.params.id).populate("comments").exec(function(err,blog){
		if(!err){
			res.render("singleblogpage",{blog:blog,loggedinusername:req.loggedinsession});
		}
	});
});

app.post("/blogs/edit/:id",iscusloggedin,function(req,res){
	var id=req.params.id;
	blogtbl.findByIdAndUpdate(id,{title:req.body.title,
								 image:req.body.image,
								 description:req.body.description},function(err,blog){
		if(!err){
			req.statussession.isstatus=true;
			req.statussession.status="Blog updated successfully!";
			res.redirect("/blogs");
		}
	});
});

app.get("/blogs/delete/:id",iscusloggedin,function(req,res){
	blogtbl.findById(req.params.id,function(err,blog){
		if(blog.username==req.loggedinsession.username){
				blogtbl.findByIdAndRemove(req.params.id,function(err,blog){
			req.statussession.isstatus=true;
			req.statussession.status="Blog deleted successfully!";
						res.redirect("/blogs");
				});
		}
	});
});
	
app.get("/settings",function(req,res){
	
	
});
app.get("/logout",function(req,res){
	req.loggedinsession.username="";
	req.loggedinsession.usertype="";
	req.cartsession.cart=[];
	req.cartsession.totalamount=0;
	req.statussession.isstatus=true;
	req.statussession.status="Logged out successfully!";
	res.redirect("/home");
});

app.post("/addcomments/:blogid",function(req,res){
commenttbl.create({username:req.loggedinsession.username,comment:req.body.comment},function(err,commentdesc){
	blogtbl.findById(req.params.blogid,function(err,blog){
		blog.comments.push(commentdesc);
		blog.save();
	});
})
});

app.post("/ar",function(req,res){
	res.render("AR",{imageaddress:req.body.imageaddress});
})

app.post('*',function(req,res){
	res.redirect("/home");
});
app.get('*',function(req,res){
	res.redirect("/home");
});

//-----------------------------------------------------------

//------------------------MIDDLEWARE-------------------------

//-----------------------------------------------------------

function isresloggedin(req,res,next){
	if(req.loggedinsession.username && req.loggedinsession.usertype=="restaurant"){
		return next();
	}
	else{
		req.statussession.isstatus=true;
		req.statussession.status="You have to be logged with your restaurant credentials in order to perform the particular action!";
		res.redirect("/Login");
	}
}

function iscusloggedin(req,res,next){
	if(req.loggedinsession.username && req.loggedinsession.usertype=="customer")	{
		return next();
	}
	else{
		req.statussession.isstatus=true;
		req.statussession.status="Login to your customer portal to perform the intended action!";
		res.redirect("/Login");
	}
}
//****************************************
//****************App Listen**************
//****************************************

app.listen(process.env.PORT || 3000,function(req,res){
	console.log("knock-eats is starting");
});
