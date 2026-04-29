/******************************************
 * 墨鱼配置监控（QX / Surge 通用纯 JS 版）
 * Author: tokuwakana
 * 每10分钟运行一次（任务计划中设置）
 * 监控地址：
 * https://ddgksf2013.top/Profile/QuantumultX.conf
 ******************************************/

const url = "https://ddgksf2013.top/Profile/QuantumultX.conf";

const KEY_VER = "ddgksf_monitor_ver";
const KEY_HASH = "ddgksf_monitor_hash";

main();

function main() {
  $task.fetch({
    url: url,
    method: "GET"
  }).then(resp => {

    const body = resp.body || "";

    const version = getMatch(body, /@ConfigVersion\s+(.+)/i, "未知版本");
    const updateTime = getMatch(body, /@UpdateTime\s+(.+)/i, "未知时间");

    const currentVer = `${version}|${updateTime}`;
    const currentHash = makeHash(body);

    const oldVer = read(KEY_VER);
    const oldHash = read(KEY_HASH);

    // 首次运行
    if (!oldVer || !oldHash) {
      save(KEY_VER, currentVer);
      save(KEY_HASH, currentHash);

      notify(
        "✅ 墨鱼监控初始化完成",
        version,
        `更新时间：${updateTime}`
      );
      return done();
    }

    let changed = false;
    let msg = [];

    // 版本变化
    if (oldVer !== currentVer) {
      changed = true;
      msg.push(`📦 ${version}`);
      msg.push(`🕒 ${updateTime}`);
    }

    // 内容变化
    if (oldHash !== currentHash) {
      changed = true;
      msg.push("📝 文件内容已变更");
    }

    if (changed) {
      save(KEY_VER, currentVer);
      save(KEY_HASH, currentHash);

      notify(
        "📢 墨鱼 QuantumultX 配置更新",
        version,
        msg.join("\n")
      );
    }

    done();

  }).catch(err => {
    notify(
      "❌ 墨鱼监控失败",
      "",
      JSON.stringify(err)
    );
    done();
  });
}

/************** 工具函数 **************/

function getMatch(text, reg, def) {
  const m = text.match(reg);
  return m ? m[1].trim() : def;
}

function read(key) {
  return $prefs.valueForKey(key);
}

function save(key, val) {
  return $prefs.setValueForKey(val, key);
}

function notify(title, sub, body) {
  $notify(title, sub, body);
}

function done() {
  $done();
}

// 简单 hash
function makeHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h.toString();
}
