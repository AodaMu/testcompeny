/**
 * 模拟API响应
 * 当后端服务不可用时，用于测试前端代码
 */

// 生成随机ID
const generateId = () => Math.floor(Math.random() * 10000).toString();

// 模拟数据
const mockData = {
  // 轮播图数据
  carousel: [
    {
      id: '1',
      title: '轮播图1',
      image: 'https://via.placeholder.com/1200x400?text=Carousel+1',
      link: 'https://example.com/1'
    },
    {
      id: '2',
      title: '轮播图2',
      image: 'https://via.placeholder.com/1200x400?text=Carousel+2',
      link: 'https://example.com/2'
    },
    {
      id: '3',
      title: '轮播图3',
      image: 'https://via.placeholder.com/1200x400?text=Carousel+3',
      link: 'https://example.com/3'
    }
  ],
  
  // 优惠政策数据
  policies: [
    {
      id: '1',
      title: '优惠政策1',
      content: '优惠政策简介1',
      image: 'https://via.placeholder.com/600x400?text=Policy+1',
      detailContent: '<h3>优惠政策详情1</h3><p>这是优惠政策1的详细内容。</p>'
    },
    {
      id: '2',
      title: '优惠政策2',
      content: '优惠政策简介2',
      image: 'https://via.placeholder.com/600x400?text=Policy+2',
      detailContent: '<h3>优惠政策详情2</h3><p>这是优惠政策2的详细内容。</p>'
    }
  ],
  
  // 产品数据
  products: [
    {
      id: '1',
      name: '产品1',
      category: '分类1',
      description: '产品1的详细描述',
      price: '99.99',
      image: 'https://via.placeholder.com/500x300?text=Product+1',
      images: [
        'https://via.placeholder.com/500x300?text=Product+1+Detail+1',
        'https://via.placeholder.com/500x300?text=Product+1+Detail+2'
      ],
      isHot: true
    },
    {
      id: '2',
      name: '产品2',
      category: '分类2',
      description: '产品2的详细描述',
      price: '199.99',
      image: 'https://via.placeholder.com/500x300?text=Product+2',
      images: [
        'https://via.placeholder.com/500x300?text=Product+2+Detail+1',
        'https://via.placeholder.com/500x300?text=Product+2+Detail+2'
      ],
      isHot: false
    },
    {
      id: '3',
      name: '产品3',
      category: '分类1',
      description: '产品3的详细描述',
      price: '299.99',
      image: 'https://via.placeholder.com/500x300?text=Product+3',
      images: [
        'https://via.placeholder.com/500x300?text=Product+3+Detail+1'
      ],
      isHot: true
    }
  ],
  
  // 关于我们数据
  about: {
    title: '关于我们',
    content: '<h2>公司简介</h2><p>我们是一家专业的公司，致力于为客户提供高质量的产品和服务。</p><p>成立于2010年，我们已经为数千家企业提供了优质服务。</p>',
    image: 'https://via.placeholder.com/800x400?text=About+Us'
  },
  
  // 联系我们数据
  contact: {
    address: '北京市海淀区中关村大街1号',
    phone: '010-12345678',
    email: 'contact@example.com',
    workTime: '周一至周五 9:00-18:00',
    socialMedia: {
      weibo: 'https://weibo.com/example',
      wechat: 'wechat_example',
      linkedin: 'https://linkedin.com/in/example'
    }
  },
  
  // Logo数据
  logo: 'https://via.placeholder.com/200x80?text=Company+Logo'
};

/**
 * 模拟API响应
 * @param {boolean} success - 是否成功
 * @param {any} data - 响应数据
 * @param {string} message - 消息
 * @param {number} delay - 延迟时间(毫秒)
 */
const mockResponse = (success = true, data = null, message = '', delay = 300) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (success) {
        resolve({
          code: 200,
          data,
          message
        });
      } else {
        resolve({
          code: 500,
          data: null,
          message: message || '服务器错误'
        });
      }
    }, delay);
  });
};

// 模拟API
const mockApi = {
  // 前台API
  getCarousel() {
    return mockResponse(true, mockData.carousel);
  },
  
  getPolicies() {
    return mockResponse(true, mockData.policies);
  },
  
  getProductById(id) {
    const product = mockData.products.find(p => p.id === id);
    return mockResponse(!!product, product, product ? '' : '产品不存在');
  },
  
  getProducts() {
    return mockResponse(true, mockData.products);
  },
  
  getHotProducts() {
    const hotProducts = mockData.products.filter(p => p.isHot);
    return mockResponse(true, hotProducts);
  },
  
  getAbout() {
    return mockResponse(true, mockData.about);
  },
  
  getContact() {
    return mockResponse(true, mockData.contact);
  },
  
  getLogo() {
    return mockResponse(true, mockData.logo);
  },
  
  // 管理员API
  adminLogin(data) {
    if (data.username === 'admin' && data.password === 'admin123') {
      return mockResponse(true, {
        token: 'mock-token-' + Date.now(),
        username: 'admin'
      }, '登录成功');
    } else {
      return mockResponse(false, null, '用户名或密码错误');
    }
  },
  
  // 轮播图管理
  getAdminCarousel() {
    return mockResponse(true, mockData.carousel);
  },
  
  addCarousel(data) {
    const newCarousel = {
      id: generateId(),
      title: data.title,
      link: data.link,
      image: data.imageFile ? `https://via.placeholder.com/1200x400?text=${data.title}` : 'https://via.placeholder.com/1200x400?text=New+Carousel'
    };
    mockData.carousel.push(newCarousel);
    return mockResponse(true, newCarousel, '添加轮播图成功');
  },
  
  updateCarousel(id, data) {
    const index = mockData.carousel.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedCarousel = {
        ...mockData.carousel[index],
        title: data.title,
        link: data.link
      };

      // 如果提供了新的图片文件，使用新的图片URL
      if (data.imageFile) {
        updatedCarousel.image = `https://via.placeholder.com/1200x400?text=${data.title}`;
      } 
      // 如果提供了图片URL（来自编辑时选择保留原图的情况）
      else if (data.image) {
        updatedCarousel.image = data.image;
      }
      
      mockData.carousel[index] = updatedCarousel;
      return mockResponse(true, updatedCarousel, '更新轮播图成功');
    }
    return mockResponse(false, null, '轮播图不存在');
  },
  
  deleteCarousel(id) {
    const index = mockData.carousel.findIndex(item => item.id === id);
    if (index !== -1) {
      mockData.carousel.splice(index, 1);
      return mockResponse(true, null, '删除轮播图成功');
    }
    return mockResponse(false, null, '轮播图不存在');
  },
  
  // 优惠政策管理
  getAdminPolicies() {
    return mockResponse(true, mockData.policies);
  },
  
  addPolicy(data) {
    const newPolicy = {
      id: generateId(),
      title: data.title,
      content: data.content,
      detailContent: data.detailContent,
      image: data.imageFile ? `https://via.placeholder.com/600x400?text=${data.title}` : 'https://via.placeholder.com/600x400?text=New+Policy'
    };
    mockData.policies.push(newPolicy);
    return mockResponse(true, newPolicy, '添加政策成功');
  },
  
  updatePolicy(id, data) {
    const index = mockData.policies.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedPolicy = {
        ...mockData.policies[index],
        title: data.title,
        content: data.content,
        detailContent: data.detailContent
      };
      if (data.imageFile) {
        updatedPolicy.image = `https://via.placeholder.com/600x400?text=${data.title}`;
      }
      mockData.policies[index] = updatedPolicy;
      return mockResponse(true, updatedPolicy, '更新政策成功');
    }
    return mockResponse(false, null, '政策不存在');
  },
  
  deletePolicy(id) {
    const index = mockData.policies.findIndex(item => item.id === id);
    if (index !== -1) {
      mockData.policies.splice(index, 1);
      return mockResponse(true, null, '删除政策成功');
    }
    return mockResponse(false, null, '政策不存在');
  },
  
  // 产品管理
  getAdminProducts() {
    return mockResponse(true, mockData.products);
  },
  
  addProduct(data) {
    const newProduct = {
      id: generateId(),
      name: data.name,
      category: data.category,
      description: data.description,
      price: data.price,
      isHot: data.isHot,
      image: data.mainFile ? `https://via.placeholder.com/500x300?text=${data.name}` : 'https://via.placeholder.com/500x300?text=New+Product',
      images: []
    };
    
    if (data.additionalFiles && data.additionalFiles.length > 0) {
      const count = Math.min(data.additionalFiles.length, 4);
      for (let i = 0; i < count; i++) {
        newProduct.images.push(`https://via.placeholder.com/500x300?text=${data.name}_${i+1}`);
      }
    }
    
    mockData.products.push(newProduct);
    return mockResponse(true, newProduct, '添加产品成功');
  },
  
  updateProduct(id, data) {
    const index = mockData.products.findIndex(item => item.id === id);
    if (index !== -1) {
      const updatedProduct = {
        ...mockData.products[index],
        name: data.name,
        category: data.category,
        description: data.description,
        price: data.price,
        isHot: data.isHot
      };
      
      if (data.mainFile) {
        updatedProduct.image = `https://via.placeholder.com/500x300?text=${data.name}`;
      }
      
      if (data.additionalFiles && data.additionalFiles.length > 0) {
        updatedProduct.images = [];
        const count = Math.min(data.additionalFiles.length, 4);
        for (let i = 0; i < count; i++) {
          updatedProduct.images.push(`https://via.placeholder.com/500x300?text=${data.name}_${i+1}`);
        }
      }
      
      mockData.products[index] = updatedProduct;
      return mockResponse(true, updatedProduct, '更新产品成功');
    }
    return mockResponse(false, null, '产品不存在');
  },
  
  deleteProduct(id) {
    const index = mockData.products.findIndex(item => item.id === id);
    if (index !== -1) {
      mockData.products.splice(index, 1);
      return mockResponse(true, null, '删除产品成功');
    }
    return mockResponse(false, null, '产品不存在');
  },
  
  // 关于我们管理
  updateAbout(data) {
    const updatedAbout = {
      ...mockData.about,
      title: data.title,
      content: data.content
    };
    
    if (data.imageFile) {
      updatedAbout.image = `https://via.placeholder.com/800x400?text=${data.title}`;
    }
    
    mockData.about = updatedAbout;
    return mockResponse(true, updatedAbout, '更新关于我们成功');
  },
  
  // 联系我们管理
  updateContact(data) {
    mockData.contact = {
      ...mockData.contact,
      ...data
    };
    return mockResponse(true, mockData.contact, '更新联系我们成功');
  },
  
  // Logo管理
  updateLogo(file) {
    if (file) {
      mockData.logo = 'https://via.placeholder.com/200x80?text=New+Logo';
    }
    return mockResponse(true, mockData.logo, '更新Logo成功');
  },
  
  // 通用文件上传
  uploadFile(file) {
    return mockResponse(true, { url: `https://via.placeholder.com/800x600?text=${file.name || 'Uploaded_File'}` }, '上传成功');
  }
};

export default mockApi; 