/**
 * 初始化示例数据
 * 用于在首次加载时向localStorage中添加演示数据
 */

export function initDemoData() {
  // 清除所有旧数据
  localStorage.removeItem('carousel');
  localStorage.removeItem('policies');
  localStorage.removeItem('products');
  localStorage.removeItem('about');
  localStorage.removeItem('contact');
  localStorage.removeItem('admin');
  localStorage.removeItem('logo');

  // 初始化轮播图数据
  localStorage.setItem('carousel', JSON.stringify([
    { 
      id: 1, 
      title: '专业服务，值得信赖', 
      image: 'https://via.placeholder.com/1920x600/FFD700/000000?text=专业服务，值得信赖', 
      link: '/about' 
    },
    { 
      id: 2, 
      title: '创新科技，引领未来', 
      image: 'https://via.placeholder.com/1920x600/FFD700/000000?text=创新科技，引领未来', 
      link: '/products' 
    },
    { 
      id: 3, 
      title: '合作共赢，共创辉煌', 
      image: 'https://via.placeholder.com/1920x600/FFD700/000000?text=合作共赢，共创辉煌', 
      link: '/contact' 
    },
  ]));

  // 初始化优惠政策数据
  localStorage.setItem('policies', JSON.stringify([
    {
      id: 1,
      title: '新客户专享优惠',
      content: '新客户首次合作，即可享受服务费9折优惠，有效期30天。',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=新客户专享优惠',
      detailContent: '<p>为了感谢新客户的信任与支持，我们特别推出新客户专享优惠活动。详细规则如下：</p><ul><li>新注册客户首次合作项目，服务费可享受9折优惠</li><li>优惠有效期为账户注册后30天内</li><li>优惠不可与其他促销活动同时使用</li><li>最高优惠金额不超过5000元</li><li>特殊项目可能不适用此优惠，详情请咨询客户经理</li></ul><p>如需了解更多详情，请联系我们的客服团队。</p>'
    },
    {
      id: 2,
      title: '长期合作伙伴计划',
      content: '连续合作超过一年的客户，可享受服务费8折优惠及专属客户经理服务。',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=长期合作伙伴计划',
      detailContent: '<p>长期合作伙伴计划是我们对忠实客户的回馈。具体权益包括：</p><ul><li>连续合作满1年，服务费8.5折</li><li>连续合作满2年，服务费8折</li><li>连续合作满3年，服务费7.5折</li><li>所有长期合作伙伴均可获得专属客户经理一对一服务</li><li>优先处理项目需求，响应时间缩短50%</li><li>每年免费参加2次行业交流会</li><li>获得最新行业资讯和解决方案</li></ul><p>成为长期合作伙伴，不仅能享受价格优惠，更能获得全方位的增值服务。</p>'
    },
    {
      id: 3,
      title: '推荐奖励计划',
      content: '成功推荐新客户，双方均可获得价值1000元的服务抵用券。',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=推荐奖励计划',
      detailContent: '<p>口碑相传是对我们最大的支持，推荐奖励计划详情如下：</p><ul><li>老客户成功推荐新客户并达成合作，推荐人可获得1000元服务抵用券</li><li>被推荐的新客户也将获得1000元服务抵用券</li><li>抵用券可用于抵扣任何服务费用</li><li>抵用券有效期为6个月</li><li>推荐奖励不设上限，多推多得</li><li>推荐成功后，双方抵用券将在3个工作日内发放</li></ul><p>推荐流程：老客户通过专属推荐链接邀请新客户注册，新客户在注册时填写推荐码并完成首次合作后，双方即可获得奖励。</p>'
    }
  ]));

  // 初始化产品数据（包括热销和非热销产品）
  localStorage.setItem('products', JSON.stringify([
    {
      id: 1,
      name: '企业门户网站建设',
      category: '网站建设',
      description: '专业的企业形象展示平台，响应式设计，PC端和移动端完美适配。',
      price: '¥15,000起',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=企业门户网站建设',
      images: [
        'https://via.placeholder.com/600x400/FFD700/000000?text=企业门户网站案例1',
        'https://via.placeholder.com/600x400/FFD700/000000?text=企业门户网站案例2'
      ],
      isHot: true  // 热销产品
    },
    {
      id: 2,
      name: '电子商务平台开发',
      category: '电商平台',
      description: '功能完善的在线商城系统，支持多种支付方式和会员管理。',
      price: '¥30,000起',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=电子商务平台开发',
      images: [
        'https://via.placeholder.com/600x400/FFD700/000000?text=电商平台案例1',
        'https://via.placeholder.com/600x400/FFD700/000000?text=电商平台案例2',
        'https://via.placeholder.com/600x400/FFD700/000000?text=电商平台案例3'
      ],
      isHot: true  // 热销产品
    },
    {
      id: 3,
      name: '微信小程序开发',
      category: '小程序开发',
      description: '定制化微信小程序开发，快速实现企业移动端营销推广。',
      price: '¥12,000起',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=微信小程序开发',
      images: [],
      isHot: false  // 非热销产品
    },
    {
      id: 4,
      name: 'APP开发服务',
      category: '移动应用',
      description: '专业的iOS和Android应用开发，提供一站式解决方案。',
      price: '¥45,000起',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=APP开发服务',
      images: [
        'https://via.placeholder.com/600x400/FFD700/000000?text=APP案例1'
      ],
      isHot: true  // 热销产品
    },
    {
      id: 5,
      name: '企业CRM系统开发',
      category: '管理系统',
      description: '定制化客户关系管理系统，帮助企业提升客户管理效率。',
      price: '¥35,000起',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=企业CRM系统开发',
      images: [],
      isHot: false  // 非热销产品
    },
    {
      id: 6,
      name: '数据可视化平台',
      category: '数据分析',
      description: '企业数据可视化平台，帮助企业快速分析和展示关键数据。',
      price: '¥25,000起',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=数据可视化平台',
      images: [],
      isHot: false  // 非热销产品
    },
    {
      id: 7,
      name: '企业OA系统开发',
      category: '管理系统',
      description: '高效的企业办公自动化系统，提升内部协作和管理效率。',
      price: '¥40,000起',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=企业OA系统开发',
      images: [],
      isHot: false  // 非热销产品
    },
    {
      id: 8,
      name: '人工智能解决方案',
      category: '前沿技术',
      description: '基于AI技术的企业定制化解决方案，包括机器学习和深度学习应用。',
      price: '¥60,000起',
      image: 'https://via.placeholder.com/600x400/FFD700/000000?text=人工智能解决方案',
      images: [
        'https://via.placeholder.com/600x400/FFD700/000000?text=AI案例1',
        'https://via.placeholder.com/600x400/FFD700/000000?text=AI案例2',
        'https://via.placeholder.com/600x400/FFD700/000000?text=AI案例3',
        'https://via.placeholder.com/600x400/FFD700/000000?text=AI案例4'
      ],
      isHot: true  // 热销产品
    }
  ]));

  // 初始化关于我们数据
  localStorage.setItem('about', JSON.stringify({
    title: '关于我们',
    content: `<h3>公司简介</h3>
    <p>我们是一家专注于数字化解决方案的创新型科技公司，成立于2010年，总部位于上海，在北京、广州、深圳等地设有分支机构。十余年来，我们始终坚持"以客户为中心，以创新为动力"的理念，为各行业客户提供专业的技术服务和解决方案。</p>
    <h3>我们的使命</h3>
    <p>通过创新科技，帮助企业实现数字化转型，提升运营效率和市场竞争力。</p>
    <h3>核心优势</h3>
    <p>- 专业的技术团队：拥有100+技术专家，涵盖前端、后端、移动端、UI/UX等各领域</p>
    <p>- 丰富的行业经验：服务过金融、教育、医疗、零售等多个行业的500+客户</p>
    <p>- 完善的服务体系：从需求分析、设计开发到上线维护的全流程专业服务</p>
    <p>- 创新的技术应用：持续关注并应用最新技术，为客户创造更大价值</p>`,
    image: 'https://via.placeholder.com/1200x800/FFD700/000000?text=关于我们'
  }));

  // 初始化联系我们数据
  localStorage.setItem('contact', JSON.stringify({
    address: '上海市浦东新区张江高科技园区科苑路88号',
    phone: '400-123-4567',
    email: 'contact@company.com',
    workTime: '周一至周五 9:00-18:00',
    socialMedia: {
      weibo: 'https://weibo.com/company',
      wechat: 'company_wechat',
      linkedin: 'https://linkedin.com/company'
    }
  }));

  // 初始化管理员账号
  localStorage.setItem('admin', JSON.stringify({
    username: 'admin',
    password: 'admin123'
  }));

  // 初始化Logo
  localStorage.setItem('logo', 'https://via.placeholder.com/200x60/FFD700/000000?text=Company+Logo');

  console.log('示例数据初始化完成');
} 