const {transferConfig} = require('./alipaySecret');
module.exports = {
	transferConfig,
	transferParams: {
		payee_type: 'ALIPAY_LOGONID',
		payer_show_name: '科创基金'
	},
	transferError: [
		{"subCode":"INVALID_PARAMETER","description":"参数有误。","solution":"请检查入参：必填参数是否为空，长度超出规定限制长度 或 是否不符合格式。"},
		{"subCode":"SYSTEM_ERROR","description":"系统繁忙","solution":"可能发生了网络或者系统异常，导致无法判定准确的转账结果。此时，商户不能直接当做转账成功或者失败处理，可以考虑采用相同的out_biz_no重发请求，或者通过调用“(alipay.fund.trans.order.query)”来查询该笔转账订单的最终状态。"},
		{"subCode":"PERMIT_CHECK_PERM_LIMITED","description":"根据监管部门的要求，请补全您的身份信息解除限制","solution":"根据监管部门的要求，请补全您的身份信息解除限制"},
		{"subCode":"PAYCARD_UNABLE_PAYMENT","description":"付款账户余额支付功能不可用","solution":"请登录支付宝站内或手机客户端开启付款账户余额支付功能。"},
		{"subCode":"PAYEE_NOT_EXIST","description":"收款账号不存在","solution":"请检查payee_account, payee_type是否匹配，如匹配，请检查payee_account是否存在。如果传了payee_real_name，请检查payee_real_name是否与payee_account匹配。"},
		{"subCode":"PAYER_DATA_INCOMPLETE","description":"根据监管部门的要求，需要付款用户补充身份信息才能继续操作","solution":"请付款方登录支付宝站内或手机客户端补充身份信息"},
		{"subCode":"PERM_AML_NOT_REALNAME_REV","description":"根据监管部门的要求，需要收款用户补充身份信息才能继续操作","solution":"请联系收款方登录支付宝站内或手机客户端补充身份信息"},
		{"subCode":"PERM_AML_NOT_REALNAME_REV","description":"根据监管部门的要求，需要收款用户补充身份信息才能继续操作","solution":"请联系收款方登录支付宝站内或手机客户端补充身份信息"},
		{"subCode":"PAYER_STATUS_ERROR","description":"付款账号状态异常","solution":"请检查付款方是否进行了自助挂失，如果无，请联系支付宝客服检查付款用户状态是否正常。"},
		{"subCode":"PAYER_STATUS_ERROR","description":"付款方用户状态不正常","solution":"请检查付款方是否进行了自助挂失，如果无，请联系支付宝客服检查用户状态是否正常。"},
		{"subCode":"PAYEE_USER_INFO_ERROR","description":"支付宝账号和姓名不匹配，请检查","solution":"请联系收款方确认收款用户姓名正确性。"},
		{"subCode":"PAYER_USER_INFO_ERROR","description":"付款用户姓名或其它信息不一致","solution":"请检查接口传递的付款方用户姓名正确性。"},
		{"subCode":"PAYER_DATA_INCOMPLETE","description":"根据监管部门的要求，需要付款用户补充身份信息才能继续操作","solution":"根据监管部门的要求，需要付款用户登录支付宝站内或手机客户端补充身份信息才能继续操作"},
		{"subCode":"PAYER_BALANCE_NOT_ENOUGH","description":"付款方余额不足","solution":"支付时间点付款方余额不足，请保持付款账户余额充足。"},
		{"subCode":"PAYMENT_INFO_INCONSISTENCY","description":"两次请求商户单号一样，但是参数不一致","solution":"如果想重试前一次的请求，请用原参数重试，如果重新发送，请更换单号。"},
		{"subCode":"CERT_MISS_TRANS_LIMIT","description":"您的付款金额已达单笔1万元或月累计5万元，根据监管部门的要求，需要付款用户补充身份信息才能继续操作","solution":"您的付款金额已达单笔1万元或月累计5万元，根据监管部门的要求，需要付款用户登录支付宝站内或手机客户端补充身份信息才能继续操作。"},
		{"subCode":"CERT_MISS_ACC_LIMIT","description":"您连续10天余额账户的资金都超过5000元，根据监管部门的要求，需要付款用户补充身份信息才能继续操作","solution":"您连续10天余额账户的资金都超过5000元，根据监管部门的要求，需要付款用户登录支付宝站内或手机客户端补充身份信息才能继续操作。"},
		{"subCode":"PAYEE_ACC_OCUPIED","description":"该手机号对应多个支付宝账户，请传入收款方姓名确定正确的收款账号","solution":"如果未传入payee_account_name，请传递payee_account_name；如果传递了payee_account_name，是因为收款登录号对应多个账户且账户名相同，请联系收款方更换登录号。"},
		{"subCode":"MEMO_REQUIRED_IN_TRANSFER_ERROR","description":"根据监管部门的要求，单笔转账金额达到50000元时，需要填写付款理由","solution":"请检查remark是否为空。"},
		{"subCode":"PERMIT_NON_BANK_LIMIT_PAYEE","description":"根据监管部门的要求，对方未完善身份信息或未开立余额账户，无法收款","solution":"请联系收款方登录支付宝站内或手机客户端完善身份信息后，重试。"},
		{"subCode":"PERMIT_PAYER_LOWEST_FORBIDDEN","description":"根据监管部门要求，付款方身份信息完整程度较低，余额支付额度受限","solution":"请付款方登录支付宝站内或手机客户端检查自己的支付额度，建议付款方尽快登录支付宝站内善身份信息提升额度。"},
		{"subCode":"PERMIT_PAYER_FORBIDDEN","description":"根据监管部门要求，付款方余额支付额度受限","solution":"请付款方登录支付宝站内或手机客户端检查自己的支付额度。"},
		{"subCode":"PERMIT_CHECK_PERM_IDENTITY_THEFT","description":"您的账户存在身份冒用风险，请进行身份核实解除限制","solution":"您的账户存在身份冒用风险，请进行身份核实解除限制"},
		{"subCode":"REMARK_HAS_SENSITIVE_WORD","description":"转账备注包含敏感词，请修改备注文案后重试","solution":"转账备注包含敏感词，请修改备注文案后重试"},
		{"subCode":"ACCOUNT_NOT_EXIST","description":"根据监管部门的要求，请补全你的身份信息，开立余额账户","solution":"请付款方登录支付宝站内或手机客户端补全身份信息。"},
		{"subCode":"PAYER_CERT_EXPIRED","description":"根据监管部门的要求，需要付款用户更新身份信息才能继续操作","solution":"根据监管部门的要求，需要付款用户登录支付宝站内或手机客户端更新身份信息才能继续操作。"},
		{"subCode":"PERMIT_NON_BANK_LIMIT_PAYEE","description":"根据监管部门的要求，对方未完善身份信息或未开立余额账户，无法收款","solution":"请联系收款方登录支付宝站内或手机客户端完善身份信息后，重试。"},
		{"subCode":"EXCEED_LIMIT_PERSONAL_SM_AMOUNT","description":"转账给个人支付宝账户单笔最多5万元","solution":"转账给个人支付宝账户单笔最多5万元。"},
		{"subCode":"EXCEED_LIMIT_ENT_SM_AMOUNT","description":"转账给企业支付宝账户单笔最多10万元","solution":"转账给企业支付宝账户单笔最多10万元。"},
		{"subCode":"EXCEED_LIMIT_SM_MIN_AMOUNT","description":"单笔最低转账金额0.1元","solution":"请修改转账金额。"},
		{"subCode":"EXCEED_LIMIT_DM_MAX_AMOUNT","description":"单日最多可转100万元","solution":"单日最多可转100万元。"},
		{"subCode":"EXCEED_LIMIT_UNRN_DM_AMOUNT","description":"收款账户未实名，单日最多可收款1000元","solution":"收款账户未实名，单日最多可收款1000元。"}
	]
};