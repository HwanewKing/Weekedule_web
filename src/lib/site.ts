export const siteConfig = {
  name: "Weekedule",
  shortName: "Weekedule",
  description:
    "Weekedule is a practical scheduling service and knowledge hub for building healthier weekly routines, family calendars, and team planning habits.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.weekedule.com",
  locale: "ko_KR",
  keywords: [
    "주간계획",
    "일정관리",
    "캘린더",
    "시간관리",
    "생산성",
    "가족 캘린더",
    "팀 일정",
    "Weekedule",
  ],
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
