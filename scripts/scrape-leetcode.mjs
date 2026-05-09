/**
 * LeetCode 数据爬虫脚本
 * 使用 Puppeteer 爬取 LeetCode 中国站用户数据
 * 支持获取多年历史数据
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LEETCODE_USERNAME = 'anagke-59';
const LEETCODE_URL = `https://leetcode.cn/u/${LEETCODE_USERNAME}/`;

async function scrapeLeetCodeData() {
  console.log('Starting LeetCode data scraping...');
  console.log(`Target URL: ${LEETCODE_URL}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920,1080'
    ]
  });

  try {
    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 1920, height: 1080 });

    // 设置 User-Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 存储拦截到的数据
    let calendarData = null;
    let problemStats = null;
    let userProfile = null;
    let problemCounts = null; // 存储题目总数 { EASY: 1061, MEDIUM: 2248, HARD: 999 }

    // 监听响应，拦截 GraphQL 请求
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('leetcode.cn/graphql')) {
        try {
          const text = await response.text();
          const json = JSON.parse(text);

          if (json.data?.userCalendar) {
            console.log('Intercepted calendar data');
            calendarData = json.data.userCalendar;
          }

          if (json.data?.userProfileUserQuestionProgress) {
            console.log('Intercepted problem stats');
            problemStats = json.data.userProfileUserQuestionProgress;
          }

          if (json.data?.userProfilePublicProfile) {
            console.log('Intercepted user profile');
            userProfile = json.data.userProfilePublicProfile;
          }

          if (json.data?.problemsetQuestionList) {
            console.log('Intercepted all problems stats');
            // 不覆盖 problemCounts，因为这是题目列表数据，不是总数
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    });

    // 访问页面
    console.log('Navigating to LeetCode profile page...');
    await page.goto(LEETCODE_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 等待数据加载
    console.log('Waiting for data to load...');
    await new Promise(r => setTimeout(r, 8000));

    // 访问题目列表页面获取真实的题目总数
    console.log('Fetching problemset page for total counts...');
    await page.goto('https://leetcode.cn/problemset/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    await new Promise(r => setTimeout(r, 3000));

    // 如果还没有获取到题目总数，尝试直接调用 API
    if (!problemCounts) {
      console.log('Trying direct API call for problem counts...');
      const problemCountsResult = await page.evaluate(async () => {
        try {
          const difficulties = ['EASY', 'MEDIUM', 'HARD'];
          const counts = {};

          for (const diff of difficulties) {
            const response = await fetch('https://leetcode.cn/graphql/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `
                  query problemsetQuestionList($filters: QuestionListFilterInput) {
                    problemsetQuestionList(filters: $filters) {
                      total
                    }
                  }
                `,
                variables: { filters: { difficulty: diff } }
              })
            });
            const result = await response.json();
            counts[diff] = result.data?.problemsetQuestionList?.total || 0;
          }

          return counts;
        } catch (e) {
          return null;
        }
      });

      if (problemCountsResult) {
        console.log('Got problem counts from API:', problemCountsResult);
        problemCounts = problemCountsResult;
      }
    }

    // 获取活跃年份列表
    let activeYears = [];
    if (calendarData?.activeYears) {
      activeYears = calendarData.activeYears;
    }

    console.log('Active years:', activeYears);

    // 获取每年的日历数据 - 使用正确的 API 端点
    const yearlyData = {};
    let totalActiveDays = 0;
    let maxStreak = 0;
    const allCalendarEntries = {};

    for (const year of activeYears) {
      console.log(`Fetching calendar data for year ${year}...`);

      // 使用正确的 GraphQL 端点和查询
      const yearCalendarResult = await page.evaluate(async (userSlug, year) => {
        try {
          const response = await fetch('https://leetcode.cn/graphql/noj-go/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                query userProfileCalendar($userSlug: String!, $year: Int) {
                  userCalendar(userSlug: $userSlug, year: $year) {
                    streak
                    totalActiveDays
                    submissionCalendar
                    activeYears
                  }
                }
              `,
              variables: { userSlug, year }
            })
          });
          const result = await response.json();
          return result.data?.userCalendar || null;
        } catch (e) {
          return null;
        }
      }, LEETCODE_USERNAME, year);

      if (yearCalendarResult) {
        const yearActiveDays = yearCalendarResult.totalActiveDays || 0;
        const yearStreak = yearCalendarResult.streak || 0;

        yearlyData[year] = {
          totalActiveDays: yearActiveDays,
          streak: yearStreak
        };

        totalActiveDays += yearActiveDays;
        maxStreak = Math.max(maxStreak, yearStreak);

        // 合并日历数据
        if (yearCalendarResult.submissionCalendar) {
          try {
            const yearCalendar = JSON.parse(yearCalendarResult.submissionCalendar);
            Object.assign(allCalendarEntries, yearCalendar);
            console.log(`Year ${year}: ${yearActiveDays} active days, ${yearStreak} streak, ${Object.keys(yearCalendar).length} entries`);
          } catch (e) {
            console.log(`Error parsing calendar for year ${year}`);
          }
        }
      } else {
        console.log(`Year ${year}: No data received`);
      }

      // 短暂延迟避免请求过快
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`Total: ${totalActiveDays} active days, ${maxStreak} max streak, ${Object.keys(allCalendarEntries).length} calendar entries`);

    // 构建用户数据
    const userData = {
      username: LEETCODE_USERNAME,
      solvedCount: 0,
      totalQuestions: 3500,
      easySolved: 0,
      easyTotal: 800,
      mediumSolved: 0,
      mediumTotal: 1800,
      hardSolved: 0,
      hardTotal: 900,
      ranking: 0,
      contributionPoints: 0,
      totalActiveDays: 0,
      recentYearActiveDays: 0,
      currentStreak: 0,
      maxStreak: 0,
      activeYears: [],
      yearlyData: {},
      submissionCalendar: {},
      scrapedAt: new Date().toISOString()
    };

    // 处理用户资料
    if (userProfile) {
      userData.ranking = userProfile.siteRanking || 0;
      if (userProfile.profile) {
        userData.username = userProfile.profile.realName || userProfile.profile.userSlug || LEETCODE_USERNAME;
      }
    }

    // 处理题目统计
    if (problemStats) {
      const accepted = problemStats.numAcceptedQuestions || [];
      accepted.forEach(item => {
        const difficulty = item.difficulty?.toUpperCase?.() || item.difficulty;
        if (difficulty === 'EASY') {
          userData.easySolved = item.count;
        } else if (difficulty === 'MEDIUM') {
          userData.mediumSolved = item.count;
        } else if (difficulty === 'HARD') {
          userData.hardSolved = item.count;
        }
      });
    }

    // 处理真实的题目总数
    console.log('problemCounts:', JSON.stringify(problemCounts, null, 2));
    if (problemCounts) {
      userData.easyTotal = problemCounts.EASY || 800;
      userData.mediumTotal = problemCounts.MEDIUM || 1800;
      userData.hardTotal = problemCounts.HARD || 900;
      console.log('Updated totals from problemCounts:', {
        easyTotal: userData.easyTotal,
        mediumTotal: userData.mediumTotal,
        hardTotal: userData.hardTotal
      });
    } else {
      console.log('WARNING: problemCounts is not available, using default values');
    }

    // 处理日历数据 - 使用新获取的多年度数据
    userData.activeYears = activeYears;
    userData.yearlyData = yearlyData;
    userData.submissionCalendar = allCalendarEntries;
    userData.totalActiveDays = totalActiveDays;
    userData.maxStreak = maxStreak;

    // 最近一年的活跃天数（当前年份或最近12个月）
    const currentYear = new Date().getFullYear();
    if (yearlyData[currentYear]) {
      userData.recentYearActiveDays = yearlyData[currentYear].totalActiveDays;
      userData.currentStreak = yearlyData[currentYear].streak || 0;
    } else if (calendarData) {
      // 回退到拦截的数据
      userData.recentYearActiveDays = calendarData.totalActiveDays || 0;
      userData.currentStreak = calendarData.streak || 0;
    }

    // 计算总数
    userData.solvedCount = userData.easySolved + userData.mediumSolved + userData.hardSolved;

    console.log('Final user data:', {
      username: userData.username,
      solvedCount: userData.solvedCount,
      easySolved: userData.easySolved,
      mediumSolved: userData.mediumSolved,
      hardSolved: userData.hardSolved,
      recentYearActiveDays: userData.recentYearActiveDays,
      totalActiveDays: userData.totalActiveDays,
      currentStreak: userData.currentStreak,
      maxStreak: userData.maxStreak,
      calendarEntries: Object.keys(userData.submissionCalendar).length
    });

    // 保存数据到 JSON 文件
    const outputPath = path.join(__dirname, '../src/data/leetcode.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(userData, null, 2));
    console.log(`Data saved to ${outputPath}`);

    return userData;

  } catch (error) {
    console.error('Error scraping LeetCode data:', error);

    const fallbackData = {
      username: LEETCODE_USERNAME,
      solvedCount: 0,
      totalQuestions: 3500,
      easySolved: 0,
      easyTotal: 800,
      mediumSolved: 0,
      mediumTotal: 1800,
      hardSolved: 0,
      hardTotal: 900,
      ranking: 0,
      contributionPoints: 0,
      totalActiveDays: 0,
      recentYearActiveDays: 0,
      currentStreak: 0,
      maxStreak: 0,
      submissionCalendar: {},
      error: error.message,
      scrapedAt: new Date().toISOString()
    };

    const outputPath = path.join(__dirname, '../src/data/leetcode.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(fallbackData, null, 2));
    console.log('Fallback data saved');

    return fallbackData;
  } finally {
    await browser.close();
  }
}

// 执行爬虫
scrapeLeetCodeData()
  .then(data => {
    console.log('Scraping completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });
