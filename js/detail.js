//导航栏组件（局部组件）
var naviGrid = Vue.extend({
	template : "#navi-template",
	data : function () {
		return {
			searchKey : '',	//搜索条件
			isLogin : false ,	//是否登录，false：未登录，true：登录
			isShow : false		//是否显示下拉
		}
	},
	props : ['dinerInfo'],
	ready : function () {
		//获取localStorage中dinerInfo
		var dinerInfoStr = localStorage.getItem("dinerInfo");
		var dinerInfoObj;
		if(dinerInfoStr !='' && dinerInfoStr != null){
			try{
				dinerInfoObj = JSON.parse(dinerInfoStr);
				if(dinerInfoObj.dinerId != null && dinerInfoObj.dinerId > 0){
					this.$parent.dinerInfo = dinerInfoObj;	//将dinerInfo赋值给父组件中的dinerInfo
					this.isLogin = true;	//将未登录变为已登录状态
				}
			}catch(e){
				console.log(e);
			}
		}
	},
	methods : {
		//退出
		logout : function () {
			//删除localStorage中dinerInfo
			localStorage.removeItem("dinerInfo");
			this.isLogin = false;	//变成未登录状态
		},
		/*
		 * 跳转到登录、注册页面
		 * type：0登录，1注册
		 */
		go2signuplogin : function (type) {
			//获取当前路径	http://localhost:8020/bonapp_web/index.html
			var loc = window.location.href;
			loc = loc.substring(loc.lastIndexOf("/")+1,loc.length);//loc.lastIndexOf("/")是loc中最后一次出现/的位置
			//将显示类型和返回的url放入sessionStorage
			var params = {showType:type,backUrl:loc};
			sessionStorage.setItem("params",JSON.stringify(params));
			window.location.href = "signup.html";
		},
		//导航栏搜索，直接利用父组件中的search方法即可。
		doSearch : function () {
			//searchKey放入sessionStorage中
			sessionStorage.setItem("searchKey",this.searchKey);
			//跳转到index.html
			window.location.href = "index.html";
		}
	}
});


var vm = new Vue({
	el : '#app',
	data : {
		dinerInfo : {},	//用户信息
		findUrl : 'http://iservice.itshsxt.com/restaurant/detail',	//餐厅详情url
		revUrl : 'http://iservice.itshsxt.com/review/find',		//评论请求地址
		restaurantId : 0,	//餐厅id
		resInfo : {},		//餐厅信息
		page : 1	,	//当前页
		query : {},		//分页信息
		reviews : []	//评论信息
	},
	components : {
		'navi-grid':naviGrid
	},
	ready : function () {
		//从sessionStorage中获取restaurantId
		var resIdStr = sessionStorage.getItem("resId");
		//若餐厅id为空，弹出提示信息，隔一秒钟后退
		if(resIdStr == '' || resIdStr == null){
			alert("Oops something wrong , please try again.");
			setTimeout(function(){
				//history.go(-1)
				window.location.href="index.html";
			},1000)
		}
		var resIdObj = JSON.parse(resIdStr);
		var restaurantId = resIdObj.restaurantId;
		//判断restaurantId是否不是一个数字
		if(isNaN(restaurantId)){
			alert("Oops something wrong , please try again.");
			return;
		}
		this.restaurantId = restaurantId;
		//拼接url
		this.findUrl = this.findUrl + "/" + this.restaurantId;
		this.findRestaurant();
		this.findReview();
	},
	methods : {
		//餐厅查询
		findRestaurant : function () {
			this.$http.jsonp(this.findUrl)
				.then(
					function (res) {
						//console.log(res);
						var data = res.data;
						if(data.resultCode == 1){//成功
							this.resInfo = data.result;
						}else {//失败
							console.log(data.message);
						}
					}
				);
		},
		//评论查询
		findReview : function (pages) {
			if(pages != null){
				this.page = pages;
			}else {
				this.page = 1;
			}
			//发送请求
			this.$http.jsonp(this.revUrl,{restaurantId:this.restaurantId,page : this.page})
				.then(
					function (res) {
						//console.log(res);
						var data = res.data;
						if(data.resultCode == 1){
							this.reviews = data.result;
							this.query = data.query;
						}else{
							console.log(data.message);
						}
					}
				);
		}
	}
});
