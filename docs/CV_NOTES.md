# CV / Interview Notes — 以实际完成内容为准

定位：把 MailPhor 写成一个可运行的 local-first engineering prototype，不写成 production SaaS 或“AI 保证准确”的产品。

## CV-ready English draft

**MailPhor — Local-first Campus Opportunity Radar**

- Built a local-first Python/JavaScript campus opportunity radar that converts forwarded university email digests into structured internship, project, scholarship and event cards.
- Implemented read-only IMAP ingestion with mailbox-scoped UID/UIDVALIDITY caching, MIME cleaning, evidence-checked links/deadlines, conservative deduplication and explicit retry/audit states.
- Integrated configurable OpenAI-compatible model providers with bounded requests, truncation/timeout protection and structured JSON validation; added profile-based explainable ranking and persistent checklists, bookmarks and application status.

## Short one-line version

Built MailPhor, a local-first LLM email radar that extracts actionable student opportunities from read-only IMAP mail and ranks them with explainable profile-based rules.

## 面试时可以补充的真实结果

- 50 项 Python 回归测试通过；隔离浏览器测试覆盖画像排序、收藏、申请状态、Checklist、同步控制和中英切换。
- 一封真实招聘 Digest 曾成功拆分为 12 条岗位；这是单样本验证，不是整体准确率。
- 真实邮箱读取采用只读 IMAP；失败的 AI 请求不会被标记为“无关”，会进入冷却和重试流程。
- 目前是 single-user local-first MVP，不声称生产部署、多用户隔离、整体召回率或长期稳定性。

可在交付验收后再写测试覆盖与演示结果。不要把47项测试或单封12岗位样本写成整体准确率，也不要将规则推荐写成AI语义推荐模型。

## 你需要能解释的六件事

1. 为什么学校Outlook难以直接接入，转发方案覆盖范围有什么局限。
2. 一封Digest如何产生多张卡片，怎样核对漏选与编造。
3. Message-ID、IMAP UID和UIDVALIDITY分别解决什么问题。
4. 事实、推荐与用户操作为什么分开保存，修改画像为什么不用重调AI。
5. 截断、网络超时和模型判无关有什么区别，如何限制重试与回收请求。
6. 为什么先本地单用户，迁移成多用户服务还需要认证、加密存储、任务队列与隔离。

## 尚不能声称

已获用户规模、生产部署、全校邮箱完整覆盖、自动联网核实、保证资格、跨设备同步、整体召回率或效率提升百分比。
学校项目和AI辅助开发的实际贡献请按事实讲：需求梳理、方案取舍、验证过程，以及你能独立解释和维护的部分。
