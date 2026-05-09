/**
 * GitHub 贡献数据爬虫脚本
 * 使用 GitHub REST API 获取用户贡献数据
 * 支持私有仓库（需要 Personal Access Token）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub 用户名
const GITHUB_USERNAME = 'jiafeng-yan';

// GitHub Token - 从环境变量获取
// 在本地开发时，可以设置环境变量 GITHUB_TOKEN
// 在 GitHub Actions 中，使用 secrets.GITHUB_TOKEN 或自定义 Secret
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function fetchGitHubAPI(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'PersonaHomepage-Bot',
    ...options.headers
  };

  // 如果有 Token，添加认证头
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function getContributionCalendar(username, year) {
  // 使用 GitHub GraphQL API 获取贡献日历
  // 这个 API 需要认证，但可以获取完整的贡献数据（包括私有仓库）

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                color
              }
            }
          }
        }
      }
    }
  `;

  // 如果有 Token，使用 GraphQL API
  if (GITHUB_TOKEN) {
    try {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          'User-Agent': 'PersonaHomepage-Bot'
        },
        body: JSON.stringify({
          query,
          variables: { username }
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0]?.message}`);
      }

      return result.data?.user?.contributionsCollection?.contributionCalendar || null;
    } catch (error) {
      console.error('GraphQL API failed:', error.message);
      return null;
    }
  }

  return null;
}

async function getYearlyContributions(username) {
  // 获取过去几年的贡献数据
  const currentYear = new Date().getFullYear();
  const years = [];

  // 从 2022 年开始获取
  for (let year = 2022; year <= currentYear; year++) {
    years.push(year);
  }

  const allContributions = {};
  let totalContributions = 0;
  let yearlyStats = {};

  for (const year of years) {
    console.log(`Fetching contributions for ${year}...`);

    // 使用 REST API 获取特定年份的贡献数据
    // 注意：GitHub REST API 不直接提供贡献日历，需要使用 GraphQL 或解析页面

    // 尝试使用 GraphQL API（需要 Token）
    if (GITHUB_TOKEN) {
      try {
        // 使用 contributionsCollection 的 from/to 参数获取特定年份
        const fromDate = `${year}-01-01T00:00:00Z`;
        const toDate = `${year}-12-31T23:59:59Z`;

        const query = `
          query($username: String!, $from: DateTime!, $to: DateTime!) {
            user(login: $username) {
              contributionsCollection(from: $from, to: $to) {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }
        `;

        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
            'User-Agent': 'PersonaHomepage-Bot'
          },
          body: JSON.stringify({
            query,
            variables: { username, from: fromDate, to: toDate }
          })
        });

        if (!response.ok) {
          console.error(`Year ${year}: API error ${response.status}`);
          continue;
        }

        const result = await response.json();

        if (result.errors) {
          console.error(`Year ${year}: GraphQL error - ${result.errors[0]?.message}`);
          continue;
        }

        const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;

        if (calendar) {
          const yearTotal = calendar.totalContributions || 0;
          totalContributions += yearTotal;

          yearlyStats[year] = {
            total: yearTotal,
            weeks: calendar.weeks?.length || 0
          };

          // 提取每日贡献数据
          if (calendar.weeks) {
            for (const week of calendar.weeks) {
              if (week.contributionDays) {
                for (const day of week.contributionDays) {
                  if (day.contributionCount > 0) {
                    // 将日期转换为时间戳（秒）
                    const date = new Date(day.date);
                    const timestamp = Math.floor(date.getTime() / 1000);
                    allContributions[timestamp] = day.contributionCount;
                  }
                }
              }
            }
          }

          console.log(`Year ${year}: ${yearTotal} contributions, ${Object.keys(allContributions).length} days`);
        }

        // 短暂延迟避免请求过快
        await new Promise(r => setTimeout(r, 500));

      } catch (error) {
        console.error(`Year ${year}: ${error.message}`);
      }
    } else {
      console.log(`Year ${year}: Skipped (no GitHub Token)`);
    }
  }

  return {
    contributions: allContributions,
    total: totalContributions,
    yearlyStats
  };
}

async function getUserStats(username) {
  // 获取用户基本统计信息
  try {
    const user = await fetchGitHubAPI(`/users/${username}`);
    return {
      publicRepos: user.public_repos || 0,
      followers: user.followers || 0,
      following: user.following || 0,
      createdAt: user.created_at || null,
      avatarUrl: user.avatar_url || null,
      bio: user.bio || null,
      location: user.location || null
    };
  } catch (error) {
    console.error('Failed to fetch user stats:', error.message);
    return null;
  }
}

async function scrapeGitHubData() {
  console.log('Starting GitHub data scraping...');
  console.log(`Target user: ${GITHUB_USERNAME}`);
  console.log(`Token available: ${GITHUB_TOKEN ? 'Yes' : 'No'}`);

  if (!GITHUB_TOKEN) {
    console.log('\n⚠️  No GitHub Token provided. Only public data will be available.');
    console.log('To include private repository contributions:');
    console.log('1. Create a Personal Access Token at https://github.com/settings/tokens');
    console.log('2. Grant "repo" scope for private repository access');
    console.log('3. Set GITHUB_TOKEN environment variable or add to GitHub Secrets\n');
  }

  try {
    // 获取用户统计信息
    console.log('\nFetching user stats...');
    const userStats = await getUserStats(GITHUB_USERNAME);
    console.log('User stats:', userStats);

    // 获取贡献数据
    console.log('\nFetching contribution data...');
    const contributionData = await getYearlyContributions(GITHUB_USERNAME);
    console.log(`Total contributions: ${contributionData.total}`);
    console.log(`Active days: ${Object.keys(contributionData.contributions).length}`);
    console.log('Yearly stats:', contributionData.yearlyStats);

    // 构建最终数据
    const data = {
      username: GITHUB_USERNAME,
      userStats,
      contributions: contributionData.contributions,
      totalContributions: contributionData.total,
      yearlyStats: contributionData.yearlyStats,
      activeDays: Object.keys(contributionData.contributions).length,
      scrapedAt: new Date().toISOString(),
      tokenUsed: !!GITHUB_TOKEN
    };

    // 保存数据
    const outputPath = path.join(__dirname, '../src/data/github.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\nData saved to ${outputPath}`);

    return data;

  } catch (error) {
    console.error('Error scraping GitHub data:', error);

    // 保存 fallback 数据
    const fallbackData = {
      username: GITHUB_USERNAME,
      userStats: null,
      contributions: {},
      totalContributions: 0,
      yearlyStats: {},
      activeDays: 0,
      error: error.message,
      scrapedAt: new Date().toISOString(),
      tokenUsed: !!GITHUB_TOKEN
    };

    const outputPath = path.join(__dirname, '../src/data/github.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(fallbackData, null, 2));
    console.log('Fallback data saved');

    return fallbackData;
  }
}

// 执行爬虫
scrapeGitHubData()
  .then(data => {
    console.log('\nScraping completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Scraping failed:', error);
    process.exit(1);
  });
