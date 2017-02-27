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
			//给父组件的searchKey赋值
			this.$parent.searchForm.searchKey = this.searchKey;
			//调用父组件中的方法
			this.$parent.search();
		}
	}
});

var vm = new Vue({
	el : "#app",
	components : {
		"navi-grid" : naviGrid	//局部组件
	},
	data : {
		dinerInfo : {},	//用户信息
		findRestaurantUrl : 'http://iservice.itshsxt.com/restaurant/find',	//餐厅搜索的url
		searchForm : {	//所有的查询条件
			page : 1,	//当前页
			searchKey : '',	//搜索条件
			cuisine : '',	//菜系
			neighborhood : '',	//行政区商圈
			averagePrice : ''	//价格
		},
		restaurants : [],	//餐厅信息
		query : {}	,	//分页信息
		showMenu : 0,	//0不显示下拉菜单
		cuisines : [] ,	//菜系
		areas : {},		//行政区商圈
		prices : []		//价格
	},
	ready : function () {
		//获取searchKey
		var searchKey = sessionStorage.getItem("searchKey");
		if(searchKey !='' && searchKey != null){
			this.searchForm.searchKey = searchKey;
			//从sessionStorage中将searchKey删除，避免再次加载页面时，再从sessionStorage中读取searchKey
			sessionStorage.removeItem("searchKey");
			//将searchKey赋值给子组件中的searchKey，这样搜索栏可以记住搜索的条件
			var children = this.$children;	//得到一个数组
			children[0].searchKey = this.searchForm.searchKey;//将searchKey赋值给子组件中的searchKey
		}
		
		//页面初始化加载数据列表
		this.search();
		//初始化条件下拉
		this.initQueryConditions();
	},
	methods : {
		/*
		 * 搜索
		 * pages：用于分页查询，代表要查询的页
		 */
		search : function (pages) {
			if(pages != null){//若pages不为null，将传递过来的参数赋值给page
				this.searchForm.page = pages;
			}else {
				this.searchForm.page = 1;
			}
			//发送请求
			this.$http.jsonp(this.findRestaurantUrl,this.searchForm)
				.then(
					function (res) {
						var data = res.data;
						if(data.resultCode == 1){//成功
							this.restaurants = data.result;
							this.query = data.query;
						}else{//失败
							console.log(data.message);
						}
					}
				);
		},
		//控制条件下拉的显示隐藏
		showQueryCondition : function (type) {
			if(this.showMenu != type){
				this.showMenu = type;
			}else {
				this.showMenu = 0;
			}
		},
		//初始化条件下拉
		initQueryConditions : function () {
			//发送请求，直接从本地的cuisine_area.json文件中获取
			this.$http.get('js/cuisine_area.json')
				.then(
					function (res) {//成功
						var data = res.data;
						this.cuisines = data.cuisines;
						this.areas = data.area;
						this.prices = data.prices;
					},
					function (errRes) {失败
						console.log(errRes);
					}
				);
		},
		//条件下拉中的条件查询
		queryConditions : function (type,value) {
			if(type == 1){
				this.searchForm.cuisine = value;
			}else if(type == 2){
				this.searchForm.neighborhood = value;
			}else if(type == 3){
				this.searchForm.averagePrice = value;
			}
			this.search();
			this.showMenu = 0;
		},
		//清除下拉条件，并重新进行查询
		resetQueryCondition : function (type) {
			if(type == null){//若为null，清除所以条件再进行查询
				this.searchForm.cuisine = '';
				this.searchForm.neighborhood = '';
				this.searchForm.averagePrice = '';
			}else if(type == 1){
				this.searchForm.cuisine = '';
			}else if(type == 2){
				this.searchForm.neighborhood = '';
			}else if(type == 3){
				this.searchForm.averagePrice = '';
			}
			
			this.search();
		},
		//跳转到餐厅详细页
		go2detail : function (resId) {
			//将餐厅Id放入sessionStorage中
			sessionStorage.setItem("resId",JSON.stringify({restaurantId:resId}));
			//跳转
			window.location.href = "detail.html";
		}
	}
});
