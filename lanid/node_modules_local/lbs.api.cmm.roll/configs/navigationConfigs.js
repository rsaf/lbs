/**
 * Created by LBS006 on 12/21/14.
 */

var navigation = {
    "personal": [{
        "main": {
            "icon": "/commons/images/menu/notificationCenter.png",
            "url": "/workspace/notifications",
            "label": "通知中心"
        },
        "sub": [{
            "url": "/workspace/notifications/all",
            "label": "所有通知"
        }, {
            "url": "/workspace/notifications/unread",
            "label": "未读通知"
        }, {
            "url": "/workspace/notifications/sent",
            "label": "已发通知"
        }]
    },
        {
            "main": {
                "icon": "/commons/images/menu/BusinessResponse.png",
                "url": "/workspace/responses",
                "label": "我的事务"
            },
            "sub": [{
                "url": "/workspace/responses/all",
                "label": "所有响应"
            }]
        },
        {
            "main": {
                "icon": "/commons/images/menu/userProfiles.png",
                "url": "/workspace/profile",
                "label": "个人资料"
            },
            "sub": [{
                "url": "/workspace/profile/personalprofile",
                "label": "我的信息"
            }]
        },
        {
            "main": {
                "icon": "/commons/images/menu/FinancialManagement.png",
                "url": "/workspace/finance",
                "label": "财务管理"
            },
            "sub": [ {
                "url": "/workspace/finance/history",
                "label": "交易统计"
            }]
        }
        ],
    "corporate": [{
        "main": {
            "icon": "/commons/images/menu/notificationCenter.png",
            "url": "/workspace/notifications",
            "label": "通知中心"
        },
        "sub": [{
            "url": "/workspace/notifications/all",
            "label": "所有通知"
        }, {
            "url": "/workspace/notifications/unread",
            "label": "未读通知"
        }, {
            "url": "/workspace/notifications/sent",
            "label": "已发通知"
        }]
       },
        {
            "main": {
                "icon": "/commons/images/menu/bussinessManagement.png",
                "url": "/workspace/activities",
                "label": "事务管理"
            },
            "sub": [{
                "url": "/workspace/activities/activitieslist",
                "label": "事务列表"
            }, {
                "url": "/workspace/activities/serviceslist",
                "label": "服务列表"
            }]
        },
        {
            "main": {
                "icon": "/commons/images/menu/FinancialManagement.png",
                "url": "/workspace/finance",
                "label": "财务管理"
            },
            "sub": [{
                "url": "/workspace/finance/status",
                "label": "账户状态"
            }, {
                "url": "/workspace/finance/history",
                "label": "交易统计"
            }]
        },
        {
            "main": {
                "icon": "/commons/images/menu/BusinessResponse.png",
                "url": "/workspace/responses",
                "label": "事务响应"
            },
            "sub": [{
                "url": "/workspace/responses/all",
                "label": "所有响应"
            }]
        },

        {
            "main": {
                "icon": "/commons/images/menu/userProfiles.png",
                "url": "/workspace/profile",
                "label": "单位资料"
            },
            "sub": [{
                "url": "/workspace/profile/corporateprofile",
                "label": "单位信息"
            }, {
                "url": "/workspace/profile/corporatedetail",
                "label": "单位详情"
            }]
        },

        {
            "main": {
                "icon": "/commons/images/menu/ServiceManagement.png",
                "url": "/workspace/services",
                "label": "服务管理"
            },
            "sub": [ {
                "url": "/workspace/services/busnessrecords",
                "label": "业务记录"
            }, {
                "url": "/workspace/services/myservicepoints",
                "label": "我的网点"
            }, {
                "url": "/workspace/services/myservices",
                "label": "我的服务"
            }]
        }],

    admin: [{
        "main": {
            "icon": "/commons/images/menu/notificationCenter.png",
            "url": "/workspace/notifications",
            "label": "通知中心"
        },
        "sub": [{
            "url": "/workspace/notifications/all",
            "label": "所有通知"
        }, {
            "url": "/workspace/notifications/unread",
            "label": "未读通知"
        }, {
            "url": "/workspace/notifications/sent",
            "label": "已发通知"
        }]
    }, {
        "main": {
            "icon": "/commons/images/menu/UserManagement.png",
            "url": "/workspace/users",
            "label": "用户管理"

        },
        "sub": [{
            "url": "/workspace/users/all",
            "label": "所有用户"
        }, {
            "url": "/workspace/users/personal",
            "label": "个人用户"
        }, {
            "url": "/workspace/users/corporate",
            "label": "单位用户"
        }, {
            "url": "/workspace/users/api",
            "label": "API用户"
        }]
    },  {
        "main": {
            "icon": "/commons/images/menu/applyManagement.png",
            "url": "/workspace/requests",
            "label": "审核管理"

        },
        "sub": [{
            "url": "/workspace/requests/all",
            "label": "所有申请"
        }, {
            "url": "/workspace/requests/unprocess",
            "label": "未审核"
        }, {
            "url": "/workspace/requests/approved",
            "label": "已通过"
        }, {
            "url": "/workspace/requests/rejected",
            "label": "已拒绝"
        }]
    }, {
        "main": {
            "icon": "/commons/images/menu/IDPhotoStandard.png",
            "url": "/workspace/standards",
            "label": "标准管理"
        },
        "sub": [{
            "url": "/workspace/standards/idPhotoStandard",
            "label": "证照标准"
        }, {
            "url": "/workspace/standards/idPhotosUsage",
            "label": "证照用途"
        }]
    },  {
        "main": {
            "icon": "/commons/images/menu/TestingCenter.png",
            "url": "/workspace/services",
            "label": "检测中心"
        },
        "sub": [{
            "url": "/workspace/inspection/unInspected",
            "label": "待检照片"
        }, {
            "url": "/workspace/inspection/qualified",
            "label": "合格照片"
        }, {
            "url": "/workspace/inspection/unQualified",
            "label": "不合格照"
        }]
    }, {
        "main": {
            "icon": "/commons/images/menu/ProductionCenter.png",
            "url": "/workspace/corrections",
            "label": "制作中心"
        },
        "sub": [{
            "url": "/workspace/corrections/unProcessed",
            "label": "待制作照"
        }, {
            "url": "/workspace/corrections/inProcess",
            "label": "正在制作"
        },
         {
          "url": "/workspace/corrections/processSuccessful",
          "label": "制作成功"
        }
         , {
            "url": "/workspace/corrections/processFailed",
            "label": "制作失败"
        }]
    },
        {
            "main": {
                "icon": "/commons/images/menu/ServiceManagement.png",
                "url": "/workspace/services",
                "label": "服务管理"
            },
            "sub": [ {
                "url": "/workspace/services/busnessrecords",
                "label": "业务记录"
            }, {
                "url": "/workspace/services/myservicepoints",
                "label": "我的网点"
            }, {
                "url": "/workspace/services/myservices",
                "label": "我的服务"
            }]
        }, {
            "main": {
                "icon": "/commons/images/menu/bussinessManagement.png",
                "url": "/workspace/activities",
                "label": "事务管理"
            },
            "sub": [{
                "url": "/workspace/activities/activitieslist",
                "label": "事务列表"
            },  {
                "url": "/workspace/activities/serviceslist",
                "label": "服务列表"
            }]
        }, {
            "main": {
                "icon": "/commons/images/menu/BusinessResponse.png",
                "url": "/workspace/responses",
                "label": "事务响应"
            },
            "sub": [{
                "url": "/workspace/responses/all",
                "label": "所有响应"
            }]
        },
        {
            "main": {
                "icon": "/commons/images/menu/FinancialManagement.png",
                "url": "/workspace/finance",
                "label": "财务管理"
            },
            "sub": [{
                "url": "/workspace/finance/status",
                "label": "账户状态"
            }, {
                "url": "/workspace/finance/history",
                "label": "交易统计"
            }]
        },
        {
            "main": {
                "icon": "/commons/images/menu/InterfaceManagement.png",
                "url": "/workspace/interfaces",
                "label": "接口管理"
            },
            "sub": [{
                "url": "/workspace/interfaces/systemInterfaces",
                "label": "蓝证提供"
            }, {
                "url": "/workspace/interfaces/thirdPartyInterfaces",
                "label": "外商提供"
            }]
        },
        {
            "main": {
                "icon": "/commons/images/menu/OperationRecord.png",
                "url": "/workspace/operationslog",
                "label": "操作记录"
            },
            "sub": [{
                "url": "/workspace/operationslog/all",
                "label": "所有操作"
            }, {
                "url": "/workspace/operationslog/business",
                "label": "业务操作"
            }, {
                "url": "/workspace/operationslog/access",
                "label": "授权操作"
            }]
        }],
    adminphotos: [{
        "main": {
            "icon": "/commons/images/menu/notificationCenter.png",
            "url": "/workspace/notifications",
            "label": "通知中心"
        },
        "sub": [{
            "url": "/workspace/notifications/all",
            "label": "所有通知"
        }, {
            "url": "/workspace/notifications/unread",
            "label": "未读通知"
        }, {
            "url": "/workspace/notifications/sent",
            "label": "已发通知"
        }]
    },  {
        "main": {
            "icon": "/commons/images/menu/TestingCenter.png",
            "url": "/workspace/services",
            "label": "检测中心"
        },
        "sub": [{
            "url": "/workspace/inspection/unInspected",
            "label": "待检照片"
        }, {
            "url": "/workspace/inspection/qualified",
            "label": "合格照片"
        }, {
            "url": "/workspace/inspection/unQualified",
            "label": "不合格照"
        }]
    }, {
        "main": {
            "icon": "/commons/images/menu/ProductionCenter.png",
            "url": "/workspace/corrections",
            "label": "制作中心"
        },
        "sub": [{
            "url": "/workspace/corrections/unProcessed",
            "label": "待制作照"
        }, {
            "url": "/workspace/corrections/inProcess",
            "label": "正在制作"
        },
            {
                "url": "/workspace/corrections/processSuccessful",
                "label": "制作成功"
            }
            , {
                "url": "/workspace/corrections/processFailed",
                "label": "制作失败"
            }]
    },
        {
            "main": {
                "icon": "/commons/images/menu/ServiceManagement.png",
                "url": "/workspace/services",
                "label": "服务管理"
            },
            "sub": [ {
                "url": "/workspace/services/busnessrecords",
                "label": "业务记录"
            }, {
                "url": "/workspace/services/myservicepoints",
                "label": "我的网点"
            }, {
                "url": "/workspace/services/myservices",
                "label": "我的服务"
            }]
        }]
};

module.exports.getNavigations = function () {
    return navigation;
};