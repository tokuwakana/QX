/*************************************************
 * App Store 更新监控（微信 / Surge / Telegram）
 * Quantumult X / Surge 通用 JS
 * Author: tokuwakana
 *
 * 功能：
 * 1. 监控 微信（国区）
 * 2. 监控 Surge（美区）
 * 3. 监控 Telegram（美区）
 * 4. 首次运行自动记录版本
 * 5. 有新版本自动通知
 *************************************************/

const APPS = [
  {
    name: "微信",
    id: "414478124",
    region: "cn"
  },
  {
    name: "Surge",
    id: "1442620678",
    region: "us"
  },
  {
    name: "Telegram",
    id: "686449807",
    region: "us"
  }
];

main();

async function main() {

  for (let app of APPS) {
    await checkApp(app);
  }

  $done();
}

async function checkApp(app) {

  const key = "app_ver_" + app.name;

  const url =
    `https://itunes.apple.com/${app.region}/lookup?id=${app.id}`;

  try {

    const resp = await $task.fetch({
      url: url,
      method: "GET"
    });

    const data = JSON.parse(resp.body);

    if (!data.results || data.results.length === 0) return;

    const result = data.results[0];

    const version = result.version || "未知版本";
    const notes = clean(result.releaseNotes || "暂无更新说明");

    const old = read(key);

    // 首次运行
    if (!old) {
      save(key, version);
      notify(
        `✅ ${app.name} 初始化完成`,
        `当前版本：${version}`,
        ""
      );
      return;
    }

    // 有更新
    if (old !== version) {

      save(key, version);

      notify(
        `📢 ${app.name} 有新版本`,
        `版本：${old} → ${version}`,
        notes.slice(0, 180)
      );
    }

  } catch (e) {

    notify(
      `❌ ${app.name} 检测失败`,
      "",
      String(e)
    );
  }
}

/******** 工具函数 ********/

function read(key) {
  return $prefs.valueForKey(key);
}

function save(key, val) {
  return $prefs.setValueForKey(val, key);
}

function notify(title, sub, body) {
  $notify(title, sub, body);
}

function clean(str) {
  return str
    .replace(/<[^>]+>/g, "")
    .replace(/\n+/g, "\n")
    .trim();
}
