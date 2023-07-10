import IndexPage from '../pages/Index'
// import Child from '../pages/child'
// import Login from '../pages/login'
// import Community from '../pages/community'
// import Search from '../pages/search'

import IndexLayout from '../layouts/Index'
import { Routers } from '../modules/renderRoutes'

// 最多只能四级嵌套路由
// 一般父级为模板路由
const routes: Routers[] = [
	{
		path: '/index',
		title: '首页',
		exact: true,
		layout: IndexLayout,
		component: IndexPage,
		redirect: '/',
	},
	{
		path: '/',
		title: '首页',
		exact: true,
		layout: IndexLayout,
		component: IndexPage,
		// redirect: '/index',
	},
]

export default routes
