let move,mid,
	scrnWidth	= document.documentElement.clientWidth,
	brand		= document.getElementById("brand"),
	caption		= document.getElementById("caption"),
	divtop		= document.querySelector(".divtop"),
	bandc		= document.getElementById("bandc"),
	searchbar	= document.getElementById("searchbar"),
	arrowup		= document.getElementById("arrowup");
divtop.addEventListener("mousemove",function(e){
	mid=(scrnWidth*0.005)/2;
	move=mid-(e.clientX*0.005);
	brand.style.transform="translateX("+move+"%)";
	caption.style.transform="translateX("+move+"%)";
});
divtop.addEventListener("mouseout",function(e){
	brand.style.transform="translateX(0%)";
	caption.style.transform="translateX(0%)";
});
document.addEventListener("scroll",function(e){
	if(window.pageYOffset>20)/*(document.documentElement.clientHeight)/2)*/
		{
			arrowup.style.visibility="visible";
			divtop.style.borderRadius="0 0 50% 50%";
		}
	else{
		arrowup.style.visibility="hidden";
		divtop.style.borderRadius="";
	}
});
searchbar.addEventListener("focus",function(){
	this.setAttribute("placeholder","");
});
searchbar.addEventListener("blur",function(){
	if(this.innerHTML=="") 
		{
			this.setAttribute("placeholder","Enter location");
		}
});
arrowup.addEventListener("click",function(){
	scroll=setInterval(function(){
		window.scrollBy(0,-10);
		if(window.pageYOffset==0){
			clearInterval(scroll);
		}
	},1)
});