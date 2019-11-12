
function autoForm(params){
	this.requestData = {}; 
	this.params = params; 
	this.submitObj = null;
	this.obj = null; 
	this.isAllowSubmit = true;
	this.url =null; 
	
	this.fileArray = new Array();
	
}
autoForm.prototype.check = function(){
	
	var firstError = null;
	var that = this;
	
	this.obj.find("input[type=text],input[type=password],textarea,select").each(function(index,ele){
		
		var check = that.check_one($(ele));
		if(!check){
			if (!firstError) firstError = $(ele);
		}
	})
	if (firstError) {
		that.scroll_erro_position(firstError);
		return false;
	}
	
	return true;

}

autoForm.prototype.check_one = function(ele){

	
	if(ele.attr("needinput")){
		if(!ele.val()){
			
			this.blank(ele);
			return false;
		}
	}
	/*
	 * 更多检查功能待完善
	 */
	this.removeBlank(ele);
	
	
	return true;
}

autoForm.prototype.blank = function(ele){

	ele.css('border', '1px solid red');
}


autoForm.prototype.removeBlank = function(ele){

	ele.css('border', '1px solid #ddd');

}

autoForm.prototype.scroll_erro_position = function(){
	
	var erroObj = this.obj;
	
	$("html,body").animate({scrollTop:$(erroObj).offset().top},500)
	
}

autoForm.prototype.setRequestData = function(){

	var obj = this.obj;
	var th = this;
	var key = obj.attr('name');
	th.requestData[key] = {};

	if( obj.find('form') && obj.find('form').length > 0 ){
		
		for(var i=0;i<obj.find('form').length;i++){
			th.requestData[key][i] = {};
			
			obj.find('form').eq(i).find("input[type=text],input[type=password],input[type=hidden],textarea").each(function(index,eleobj){
				
				var name = $(eleobj).prop('name');
				//console.log(i)
				//console.log(name)
				//console.log( $(eleobj).val() )		
				th.requestData[key][i][name] = $(eleobj).val();
				
			})
			obj.find('form').eq(i).find("input[type=radio]:checked").each( function (index, ele) {
				var name = $(ele).prop('name');
				th.requestData[key][i][name] = $(ele).val();
			} );
			
			obj.find('form').eq(i).find("input[type=checkbox]:checked").each( function (index, ele) {
				
				var name = $(ele).prop('name');
				var val = $(ele).val();	
				
				if( typeof(th.requestData[key][i][name]) !== 'object' ) {
					th.requestData[key][i][name] = new Array();
				}
				
				th.requestData[key][i][name].push( val );
				
			} );
			
			
			obj.find('form').eq(i).find('select').each( function (index, ele) {
				
				var name = $(ele).prop('name');
				
				th.requestData[key][i][name] = $(ele).val();
				
			})
			
			if( th.fileArray ) {
				
				obj.find('form').eq(i).find('input[type=file]').each( function (index, ele) {
					
					var name = $(ele).prop('name');
					//console.log(i);
					//console.log(th.fileArray[i]);
					//console.log(th.fileArray[i][name]);
					th.requestData[key][i][name] = th.fileArray[i][name];
					
					
				})
				
				
			}
			
			
		}
		
	}


}

autoForm.prototype.showSuccess = function(msg){
	
	var  json = JSON.parse(msg);
	
	if(json.code == 200){

		this.obj.find('input[name=id]').val(json.data.id);


		
		if( this.fileArray ) {
				var obj = this.obj;
				var th = this;

				for(var i=0;i<obj.find('form').length;i++){	
						obj.find('form').eq(i).find('input[type=file]').each( function (index, ele) {
							
						var name = $(ele).prop('name');
						th.fileArray[i][name] = new Array();
				
					})
					
				}
			console.log(this.fileArray);	
		}else{
			console.log('not file');
		}

		alert('操作成功');
	}else{
		alert(json.msg);
	}

}

autoForm.prototype.showError = function(msg){
	alert(msg)
}


autoForm.prototype.changeFile = function(){
	
	
	var obj = this.obj;
	var that = this;
	if( obj.find('form') && obj.find('form').length > 0 ){
	
		for(var i=0;i<obj.find('form').length;i++){
			that.fileArray[i] = {};
			
			var j = i;

			obj.find('form').eq(i).find("input[type=file]").each( function(index, ele){
				
				var name = $(ele).prop('name');
				
				if( that.fileArray[i][name]  !== 'object' ) {
					that.fileArray[i][name] = new Array();
				}
				
				$(ele).change( function(){
					//var j = $(this).parents('form').index();
					
					that.isAllowSubmit = false;
					var file = this.files;
					that.readFile(file, $(this), index, j);
					
				})
				
			})
			
		}
	} 
	
}



autoForm.prototype.readFile = function (files, obFile, ind, form_i) {
	if(files) {
		
		var that = this;
		var name = obFile.prop('name');
		for(var img_i=0;img_i<files.length;img_i++){
			var reader = new FileReader();
			var file = files[img_i];
			reader.readAsDataURL(file);
			
			reader.addEventListener('load',function () {
				
				if(file.type.match('image.*')){
					
					var img = document.createElement('img');
					obFile.parents('form').find(that.params.img_load[ind]).append(img)
			        img.src = this.result;	
			        //console.log(form_i);
			        //console.log(name);
			        //console.log(that.fileArray)
					that.fileArray[form_i][name].push(this.result);
					
					that.isAllowSubmit = true;
				}else{
					that.isAllowSubmit = true;
					that.showError('只能上传图片类型的文件');
					return false;
				}
			})
		}
	}	
	return;
}


autoForm.prototype.init = function(){
	this.obj = $( this.params.obj );
	this.url = this.params.url;
	this.submitObj = this.obj.find( this.params.submit  );
	var that = this;
	

	this.obj.find("input[type=text],input[type=password],textarea,select").blur(function(){
			that.check_one($(this));
	})
	
	this.changeFile();
	
	this.submitObj.click(function(){
		
		//console.log(that.fileArray);
		if(!that.isAllowSubmit) return;
		that.isAllowSubmit = false;
		//console.log(1);
		if(!that.check()){
			that.isAllowSubmit = true;
			return false;
		}
		//console.log(2);
		that.setRequestData();
		
		$.ajax({
			type: "POST",
			url: that.url,
			data: that.requestData,
			success: function(msg){
				that.isAllowSubmit = true;
				that.showSuccess(msg);
			},
			error: function () {
				that.isAllowSubmit = true;
				that.showError('网络链接错误!');
			}
		});
		
	})
	
	
}
