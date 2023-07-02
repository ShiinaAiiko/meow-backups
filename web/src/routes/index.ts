import IndexPage from '../pages/Index'
import SsoPage from '../pages/Sso'
// import Child from '../pages/child'
// import Login from '../pages/login'
// import Community from '../pages/community'
// import Search from '../pages/search'

import IndexLayout from '../layouts/Index'
import { Routers } from '../modules/renderRoutes'

// 最多只能四级嵌套路由
// 一般父级为模板路由
const routes: Routers[] = [
	// {
	// 	path: '/login',
	// 	title: '登录',
	// 	exact: true,
	// 	layout: SubframeLayout,
	// 	component: UserLoginPage,
	// },
	{
		path: '/index',
		title: '首页',
		exact: true,
		layout: IndexLayout,
		component: IndexPage,
		redirect: '/',
		// children: [
		// 	{
		// 		path: '/index/child',
		// 		title: '子组件',
		// 		exact: true,
		// 		component: Child,
		// 	},
		// ],
	},
	{
		path: '/',
		title: '首页',
		exact: true,
		layout: IndexLayout,
		component: IndexPage,
		// redirect: '/index',
	},

	// {
	// 	path: '/m',
	// 	title: 'SSO',
	// 	exact: true,
	// 	layout: IndexLayout,
	// 	component: MobileIndexPage,
	// 	CSSTransitionClassName: 'mobile-page-animation',
	// 	// redirect: '/index',
	// },
	// {
	// 	path: '/m/n',
	// 	title: 'SSO',
	// 	exact: true,
	// 	layout: IndexLayout,
	// 	component: MobileNotePage,
	// 	CSSTransitionClassName: 'mobile-page-animation',
	// 	// redirect: '/index',
	// },
	// {
	// 	path: '/m/c',
	// 	title: 'SSO',
	// 	exact: true,
	// 	layout: IndexLayout,
	// 	component: MobilePagesListPage,
	// 	CSSTransitionClassName: 'mobile-page-animation',
	// 	// redirect: '/index',
	// },
	// {
	// 	path: '/m/p',
	// 	title: 'SSO',
	// 	exact: true,
	// 	layout: IndexLayout,
	// 	component: MobilePageContentPage,
	// 	CSSTransitionClassName: 'mobile-page-animation',
	// 	// redirect: '/index',
	// },

	{
		path: '/sso',
		title: 'SSO',
		exact: true,
		layout: IndexLayout,
		component: SsoPage,
		// redirect: '/index',
	},
]

export default routes
