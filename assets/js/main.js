// Lucyware — 클라이언트 스크립트
// Phase 2: 문의 폼 → fetch('/api/contact'), Text2SQL 조회 → fetch('/api/query')
// (현재 Phase 1: 정적, API 미연동)
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });
});
