import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { dump } from 'js-yaml';

export function parseLecturesFromHtml(html) {
  const $ = cheerio.load(html);
  const lectures = [];

  // Find lectures table
  const table = $('#lectures').find('table').first();
  if (!table.length) return lectures;

  const rows = table.find('tbody tr');
  rows.each((_, tr) => {
    const tds = $(tr).find('td');
    if (tds.length < 4) return;

    // Col 0: Lecture number
    const numText = $(tds[0]).text().trim();
    if (!numText && isNaN(parseInt(numText))) return;
    const num = isNaN(parseInt(numText)) ? numText : parseInt(numText);

    // Col 1: Date
    const date = $(tds[1]).html()?.trim() || '';

    // Col 2: Topics
    const topics = [];
    const lis = $(tds[2]).find('li');
    if (lis.length > 0) {
      lis.each((_, li) => {
        const text = $(li).text().trim();
        if (text) topics.push(text);
      });
    } else {
      const text = $(tds[2]).text().trim();
      if (text) topics.push(text);
    }

    // Col 3: Slides, Videos
    const slides_videos = [];
    $(tds[3]).find('a').each((_, a) => {
      const href = $(a).attr('href');
      const text = $(a).text().trim();
      if (href && text) {
        slides_videos.push({ text, url: href });
      }
    });

    // Col 4: Additional Materials
    const additional_materials = [];
    if (tds.length >= 5) {
      $(tds[4]).find('a').each((_, a) => {
        const href = $(a).attr('href');
        const text = $(a).text().trim();
        if (href && text) {
          additional_materials.push({ text, url: href });
        }
      });
    }

    // Col 5: Quiz
    let quiz = undefined;
    if (tds.length >= 6) {
      const quizTd = $(tds[5]);
      const quizText = quizTd.text().trim();
      const quizA = quizTd.find('a');
      const rowspan = parseInt(quizTd.attr('rowspan') || '1');
      if (quizText && quizText !== 'No Quiz') {
        quiz = {
          text: quizText,
          url: quizA.attr('href') || undefined,
          rowspan: isNaN(rowspan) ? 1 : rowspan
        };
      }
    }

    lectures.push({
      number: num,
      date,
      topics,
      slides_videos,
      additional_materials,
      quiz
    });
  });

  return lectures;
}

export function parseRecitationsFromHtml(html) {
  const $ = cheerio.load(html);
  
  // Find recitations table
  let table = $('#recitations').nextAll('.table-responsive').first().find('table');
  if (!table.length) {
    table = $('h2:contains("Recitations")').nextAll('.table-responsive').first().find('table');
  }
  if (!table.length) {
    table = $('h2:contains("Recitations/Labs")').nextAll('.table-responsive').first().find('table');
  }

  const recitations_0 = [];
  const standardRecitations = [];

  if (!table.length) {
    return { recitations_0, recitations: standardRecitations };
  }

  // Iterate rows
  const rows = table.find('tbody tr');
  let currentDay = {
    date: '',
    groups: []
  };

  rows.each((_, tr) => {
    const tds = $(tr).find('td');
    if (!tds.length) return;

    // Check if this has Recitation 0.x format
    const recId = $(tds[0]).text().trim();
    if (recId.startsWith('0.') || recId === '0') {
      // Recitation 0 item
      const title = $(tr).find('td:nth-child(4)').text().trim() || $(tr).find('td:nth-child(3)').text().trim();
      const materials = [];
      $(tr).find('a').each((_, a) => {
        const text = $(a).text().trim();
        const url = $(a).attr('href');
        if (url && text && !text.toLowerCase().includes('youtube') && !text.toLowerCase().includes('link') && !url.includes('youtu')) {
          materials.push({ text, url });
        }
      });
      const videos = [];
      $(tr).find('a').each((_, a) => {
        const text = $(a).text().trim();
        const url = $(a).attr('href');
        if (url && (url.includes('youtu') || text.toLowerCase().includes('youtube') || text.toLowerCase().includes('link'))) {
          videos.push({ text, url });
        }
      });

      const topicObj = {
        id: recId,
        title: title || `Recitation ${recId}`,
        materials,
        videos
      };

      if (currentDay.groups.length === 0) {
        currentDay.groups.push({ name: 'Fundamentals', topics: [topicObj] });
      } else {
        currentDay.groups[0].topics.push(topicObj);
      }
    } else {
      // Standard Lab or Bootcamp
      const topicText = $(tds[3] || tds[2]).text().trim() || recId;
      const dateText = $(tds[1]).html()?.trim() || '';
      const materials = [];
      const videos = [];
      $(tr).find('a').each((_, a) => {
        const text = $(a).text().trim();
        const url = $(a).attr('href');
        if (url && (url.includes('youtu') || text.toLowerCase().includes('youtube') || text.toLowerCase().includes('link'))) {
          videos.push({ text, url });
        } else if (url && text) {
          materials.push({ text, url });
        }
      });

      standardRecitations.push({
        number: recId,
        date: dateText,
        topics: [topicText],
        slides_videos: videos,
        notes_code: materials
      });
    }
  });

  if (currentDay.groups.length > 0) {
    recitations_0.push(currentDay);
  }

  return { recitations_0, recitations: standardRecitations };
}

export function parseAssignmentsFromHtml(html) {
  const $ = cheerio.load(html);
  let table = $('#deadlines');
  
  // Fallback for S20 style table
  if (!table.length || table.find('tbody tr').length === 0) {
    $('table').each((_, tbl) => {
      const headerText = $(tbl).find('thead').text().toLowerCase();
      if (headerText.includes('release date') && (headerText.includes('early-submission') || headerText.includes('on-time deadline'))) {
        table = $(tbl);
      }
    });
  }

  const assignment_groups = [];
  if (!table.length) return { assignment_groups };

  const rows = table.find('tbody tr');
  let currentGroup = null;
  let currentHwNum = '';

  rows.each((_, tr) => {
    const tds = $(tr).find('td');
    if (!tds.length) return;

    // Check if first col has text or is empty
    let asgCol = $(tds[0]).text().trim();
    if (asgCol) {
      currentHwNum = asgCol;
    }

    // Check format: S20 has [Number, Part, Topics, Release Date, Early, On-time, Links]
    if (tds.length >= 7) {
      const part = $(tds[1]).text().trim();
      const asgName = currentHwNum ? `${currentHwNum} ${part}`.trim() : part;
      const releaseDate = $(tds[3]).text().trim();
      const earlyDate = $(tds[4]).text().trim();
      const onTimeDate = $(tds[5]).text().trim();
      let due = '';
      if (earlyDate && onTimeDate) {
        due = `Early: ${earlyDate}<br>On-Time: ${onTimeDate}`;
      } else {
        due = onTimeDate || earlyDate;
      }

      const materials = [];
      $(tds[6]).find('a').each((_, a) => {
        const text = $(a).text().trim();
        const url = $(a).attr('href');
        if (url && text) materials.push({ text, url });
      });

      if (releaseDate || !currentGroup) {
        currentGroup = {
          release_date: releaseDate || 'Semester Ongoing',
          assignments: []
        };
        assignment_groups.push(currentGroup);
      }

      currentGroup.assignments.push({
        name: asgName || 'Assignment',
        due_date: due,
        materials
      });
      return;
    }

    // Standard format (F24, S25, F23 etc)
    const asgName = $(tds[0]).text().trim();
    if (!asgName) return;

    let releaseDate = '';
    let dueDate = '';
    let materialsTd = null;

    if (tds.length === 4) {
      releaseDate = $(tds[1]).html()?.trim() || '';
      dueDate = $(tds[2]).html()?.trim() || '';
      materialsTd = $(tds[3]);
    } else if (tds.length === 3) {
      dueDate = $(tds[1]).html()?.trim() || '';
      materialsTd = $(tds[2]);
    } else if (tds.length === 2) {
      materialsTd = $(tds[1]);
    }

    const materials = [];
    if (materialsTd) {
      materialsTd.find('a').each((_, a) => {
        const text = $(a).text().trim();
        const url = $(a).attr('href');
        if (url && text) {
          materials.push({ text, url });
        }
      });
    }

    if (releaseDate || !currentGroup) {
      currentGroup = {
        release_date: releaseDate || 'Semester Ongoing',
        assignments: []
      };
      assignment_groups.push(currentGroup);
    }

    currentGroup.assignments.push({
      name: asgName,
      due_date: dueDate,
      materials
    });
  });

  return { assignment_groups };
}
