# 学校邮件与证据核对

默认仅处理发件地址属于 cityu.edu.hk 及其子域（例如 gapps.cityu.edu.hk）的邮件。
这只是地址范围过滤，不是邮件真伪认证。转发后的 From 如果不是学校域名，需要调整配置。

可在 config.local.json 添加 `"SOURCE_DOMAINS": "cityu.edu.hk"`；多个域名用英文逗号分隔。
不需要修改现有 Outlook 转发规则。QQ 自身推广邮件不会送入 AI。

新卡片保留邮件主题、发件人、日期、正文前 4000 字，以及 AI 提取的逐字证据。
没有能在正文找到的 deadline_evidence 时，截止日期回退 Unknown。
申请链接必须来自送入 AI 的正文。证据匹配不等于语义准确，请核对截止日期与活动日期。
正文节选会保存到本机 opportunities.json，该文件不应公开提交。

已有卡片不自动重新分类；需要核对原邮件。运行 `python -m unittest test_mailphor_validation` 验证本地逻辑。
