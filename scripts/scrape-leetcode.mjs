/**
 * LeetCode 数据爬虫脚本
 * 使用 Puppeteer 爬取 LeetCode 中国站用户数据
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
    let allProblems = null; // 存储所有题目统计

    // 监听响应，拦截 GraphQL 请求
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('leetcode.cn/graphql')) {
        try {
          const text = await response.text();
          const json = JSON.parse(text);

          // 拦截日历数据
          if (json.data?.userCalendar) {
            console.log('Intercepted calendar data');
            calendarData = json.data.userCalendar;
          }

          // 拦截题目统计
          if (json.data?.userProfileUserQuestionProgress) {
            console.log('Intercepted problem stats');
            problemStats = json.data.userProfileUserQuestionProgress;
          }

          // 拦截用户资料
          if (json.data?.userProfilePublicProfile) {
            console.log('Intercepted user profile');
            userProfile = json.data.userProfilePublicProfile;
          }

          // 拦截所有题目统计（包含总数）
          if (json.data?.problemsetQuestionList) {
            console.log('Intercepted all problems stats');
            allProblems = json.data.problemsetQuestionList;
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    });

    // 访问页面
    console.log('Navigating to LeetCode profile page...');
    await page.goto(LEETCODE_URL, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // 等待数据加载
    console.log('Waiting for data to load...');
    await new Promise(r => setTimeout(r, 10000)); // 增加等待时间

    // 如果还没有日历数据，再等一会儿
    if (!calendarData) {
      console.log('Waiting more for calendar data...');
      await new Promise(r => setTimeout(r, 5000));
    }

    // 访问题目列表页面获取真实的题目总数
    console.log('Fetching problemset page for total counts...');
    await page.goto('https://leetcode.cn/problemset/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await new Promise(r => setTimeout(r, 5000));

    // 如果还没有获取到题目总数，尝试直接调用 API
    if (!allProblems) {
      console.log('Trying direct API call for problem counts...');
      const problemCountsResult = await page.evaluate(async () => {
        try {
          // 分别查询各难度的题目总数
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
        allProblems = { counts: problemCountsResult };
      }
    }

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
      currentStreak: 0,
      activeYears: [],
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
    if (allProblems?.counts) {
      userData.easyTotal = allProblems.counts.EASY || 800;
      userData.mediumTotal = allProblems.counts.MEDIUM || 1800;
      userData.hardTotal = allProblems.counts.HARD || 900;
      console.log('Updated problem totals:', {
        easy: userData.easyTotal,
        medium: userData.mediumTotal,
        hard: userData.hardTotal
      });
    }

    // 处理日历数据
    if (calendarData) {
      userData.totalActiveDays = calendarData.totalActiveDays || 0;
      userData.currentStreak = calendarData.streak || 0;
      userData.activeYears = calendarData.activeYears || [];

      // 解析提交日历 JSON 字符串
      if (calendarData.submissionCalendar) {
        try {
          userData.submissionCalendar = JSON.parse(calendarData.submissionCalendar);
          console.log(`Parsed ${Object.keys(userData.submissionCalendar).length} calendar entries`);
        } catch (e) {
          console.error('Failed to parse submissionCalendar:', e.message);
        }
      }
    } else {
      console.log('Calendar data not intercepted, trying direct API call...');

      // 尝试直接调用 API（可能需要特定的请求头）
      const apiResult = await page.evaluate(async (username) => {
        try {
          const response = await fetch('https://leetcode.cn/graphql/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                query userCalendar($username: String!) {
                  userCalendar(username: $username) {
                    activeYears
                    streak
                    totalActiveDays
                    submissionCalendar
                  }
                }
              `,
              variables: { username }
            })
          });

          const result = await response.json();
          return result.data?.userCalendar || null;
        } catch (e) {
          return null;
        }
      }, LEETCODE_USERNAME);

      if (apiResult) {
        console.log('API call succeeded');
        userData.totalActiveDays = apiResult.totalActiveDays || 0;
        userData.currentStreak = apiResult.streak || 0;
        userData.activeYears = apiResult.activeYears || [];
        if (apiResult.submissionCalendar) {
          try {
            userData.submissionCalendar = JSON.parse(apiResult.submissionCalendar);
            console.log(`Parsed ${Object.keys(userData.submissionCalendar).length} calendar entries`);
          } catch (e) {}
        }
      }
    }

    // 计算总数
    userData.solvedCount = userData.easySolved + userData.mediumSolved + userData.hardSolved;

    console.log('Final user data:', {
      username: userData.username,
      solvedCount: userData.solvedCount,
      easySolved: userData.easySolved,
      mediumSolved: userData.mediumSolved,
      hardSolved: userData.hardSolved,
      totalActiveDays: userData.totalActiveDays,
      currentStreak: userData.currentStreak,
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

    // 如果爬取失败，尝试使用备用数据
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
      currentStreak: 0,
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
