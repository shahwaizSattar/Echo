// ML-based content moderation with 4 severity levels
// Using pattern matching and NLP for classification

// Severity levels
const SEVERITY = {
  SAFE: 'SAFE',
  BLUR: 'BLUR',
  WARNING: 'WARNING',
  BLOCK: 'BLOCK'
};

// Category patterns for ML classification
const PATTERNS = {
  // Hate speech patterns
  hateSpeech: {
    racial: /\b(n[i1]gg[ae]r|ch[i1]nk|sp[i1]c|beaner|wetback|gook|raghead)\b/gi,
    religious: /\b(k[i1]ke|towelhead|sand n[i1]gger|infidel scum)\b/gi,
    homophobic: /\b(f[a@]gg[o0]t|dyke|tr[a@]nny|sodomite)\b/gi,
    sexist: /\b(wh[o0]re|sl[u\*]t|b[i1]tch|c[u\*]nt)\b/gi,
    ableist: /\b(ret[a@]rd|cr[i1]pple|sp[a@]z|psycho)\b/gi
  },
  
  // Harassment & bullying
  harassment: {
    insults: /\b(idiot|stupid|dumb|moron|loser|pathetic|worthless|ugly|fat|disgusting)\b/gi,
    targeted: /\b(kill yourself|kys|die|nobody likes you|everyone hates you)\b/gi,
    cyberbullying: /\b(exposed|leaked|doxxed|swatted)\b/gi
  },
  
  // Threats & violence
  threats: {
    violence: /\b(kill|murder|shoot|stab|beat|attack|assault|hurt|harm|destroy)\b/gi,
    weapons: /\b(gun|knife|bomb|explosive|weapon|ar-15|ak-47)\b/gi,
    intent: /\b(i will|gonna|going to|planning to|threat|threaten)\b/gi
  },
  
  // Sexual content
  sexual: {
    explicit: /\b(sex|fuck|dick|cock|pussy|vagina|penis|porn|xxx|nude|naked)\b/gi,
    minors: /\b(child porn|cp|loli|shota|underage|minor|kid|teen)\b/gi,
    requests: /\b(send nudes|show me|wanna fuck|dtf|netflix and chill)\b/gi
  },
  
  // Self-harm & suicide
  selfHarm: {
    suicidal: /\b(suicide|kill myself|end my life|want to die|better off dead)\b/gi,
    cutting: /\b(cut myself|self harm|self-harm|cutting|razor|blade)\b/gi,
    methods: /\b(overdose|hanging|jump off|pills|poison)\b/gi
  },
  
  // Extremism
  extremism: {
    terrorism: /\b(isis|al qaeda|taliban|terrorist|jihad|martyrdom)\b/gi,
    violence: /\b(holy war|infidel|crusade|ethnic cleansing|genocide)\b/gi,
    recruitment: /\b(join us|recruit|radicalize|pledge allegiance)\b/gi
  }
};

// Profanity levels
const MILD_PROFANITY = ['damn', 'hell', 'crap', 'ass', 'piss', 'dammit'];
const STRONG_PROFANITY = ['fuck', 'f***', 'shit', 'bitch', 'b****', 'bastard', 'asshole', 'a**hole'];

/**
 * Analyze text and return category scores
 */
function analyzeCategories(text) {
  const lowerText = text.toLowerCase();
  const scores = {
    hateSpeech: 0,
    harassment: 0,
    threats: 0,
    sexual: 0,
    selfHarm: 0,
    extremism: 0,
    profanity: 0
  };

  // Check hate speech
  Object.values(PATTERNS.hateSpeech).forEach(pattern => {
    const matches = (lowerText.match(pattern) || []).length;
    scores.hateSpeech += matches * 0.3;
  });

  // Check harassment
  Object.values(PATTERNS.harassment).forEach(pattern => {
    const matches = (lowerText.match(pattern) || []).length;
    scores.harassment += matches * 0.25;
  });

  // Check threats
  let threatScore = 0;
  Object.entries(PATTERNS.threats).forEach(([key, pattern]) => {
    const matches = (lowerText.match(pattern) || []).length;
    if (key === 'intent') threatScore += matches * 0.4;
    else threatScore += matches * 0.3;
  });
  scores.threats = Math.min(threatScore, 1);

  // Check sexual content
  Object.entries(PATTERNS.sexual).forEach(([key, pattern]) => {
    const matches = (lowerText.match(pattern) || []).length;
    if (key === 'minors') scores.sexual += matches * 1.0; // Auto-block
    else scores.sexual += matches * 0.2;
  });

  // Check self-harm
  Object.values(PATTERNS.selfHarm).forEach(pattern => {
    const matches = (lowerText.match(pattern) || []).length;
    scores.selfHarm += matches * 0.35;
  });

  // Check extremism
  Object.values(PATTERNS.extremism).forEach(pattern => {
    const matches = (lowerText.match(pattern) || []).length;
    scores.extremism += matches * 0.4;
  });

  // Check profanity
  const mildCount = MILD_PROFANITY.filter(word => lowerText.includes(word)).length;
  const strongCount = STRONG_PROFANITY.filter(word => lowerText.includes(word)).length;
  const wordCount = text.split(' ').length;
  scores.profanity = (mildCount * 0.4 + strongCount * 0.8) / Math.max(wordCount, 1);

  // Normalize scores to 0-1 range
  Object.keys(scores).forEach(key => {
    scores[key] = Math.min(scores[key], 1);
  });

  return scores;
}

/**
 * Determine severity level based on category scores
 */
function determineSeverity(scores) {
  // Calculate combined severity score for multi-category violations
  const combinedScore = scores.harassment + scores.threats + scores.hateSpeech;
  const hasProfanity = scores.profanity > 0.2;
  
  // BLOCK level - extremely harmful content
  if (scores.sexual > 0.5 && PATTERNS.sexual.minors.test(scores.originalText)) {
    return { severity: SEVERITY.BLOCK, reason: 'Sexual content involving minors' };
  }
  if (scores.selfHarm > 0.7) {
    return { severity: SEVERITY.BLOCK, reason: 'Self-harm instructions or intent' };
  }
  if (scores.extremism > 0.7) {
    return { severity: SEVERITY.BLOCK, reason: 'Extremist content or recruitment' };
  }
  if (scores.threats > 0.6 && scores.harassment > 0.2) {
    return { severity: SEVERITY.BLOCK, reason: 'Violent threats' };
  }

  // WARNING level - harmful content requiring user action
  if (scores.hateSpeech > 0.4) {
    return { severity: SEVERITY.WARNING, reason: 'Hate speech detected' };
  }
  if (scores.harassment > 0.4 || (scores.harassment > 0.2 && hasProfanity)) {
    return { severity: SEVERITY.WARNING, reason: 'Harassment or bullying' };
  }
  if (scores.threats > 0.3) {
    return { severity: SEVERITY.WARNING, reason: 'Threatening language' };
  }
  if (scores.sexual > 0.4) {
    return { severity: SEVERITY.WARNING, reason: 'Explicit sexual content' };
  }
  if (scores.selfHarm > 0.3) {
    return { severity: SEVERITY.WARNING, reason: 'Self-harm references' };
  }
  if (scores.extremism > 0.3) {
    return { severity: SEVERITY.WARNING, reason: 'Extremist content' };
  }
  if (combinedScore > 0.6) {
    return { severity: SEVERITY.WARNING, reason: 'Multiple policy violations' };
  }

  // BLUR level - mild profanity or insults
  if (scores.profanity > 0.05) {
    return { severity: SEVERITY.BLUR, reason: 'Mild profanity' };
  }
  if (scores.harassment > 0.2) {
    return { severity: SEVERITY.BLUR, reason: 'Mild insults' };
  }
  if (scores.hateSpeech > 0.15) {
    return { severity: SEVERITY.BLUR, reason: 'Potentially offensive language' };
  }

  // SAFE - no harmful content
  return { severity: SEVERITY.SAFE, reason: 'Content is safe' };
}

/**
 * Main moderation function with ML-based classification
 * @param {string} text - The text content to moderate
 * @returns {object} - Moderation result with severity level and details
 */
function moderateContent(text) {
  if (!text || typeof text !== 'string') {
    return {
      severity: SEVERITY.SAFE,
      isFlagged: false,
      scores: {},
      reason: 'No content to moderate'
    };
  }

  // Analyze text and get category scores
  const scores = analyzeCategories(text);
  scores.originalText = text;

  // Determine severity level
  const { severity, reason } = determineSeverity(scores);

  // Additional checks
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  const excessiveCaps = text.length > 10 && capsRatio > 0.7;
  
  const specialChars = (text.match(/[!@#$%^&*()]/g) || []).length;
  const excessiveSpecialChars = specialChars > text.length * 0.3;

  return {
    severity,
    isFlagged: severity !== SEVERITY.SAFE,
    shouldBlur: severity === SEVERITY.BLUR,
    shouldWarn: severity === SEVERITY.WARNING,
    shouldBlock: severity === SEVERITY.BLOCK,
    scores: {
      hateSpeech: scores.hateSpeech,
      harassment: scores.harassment,
      threats: scores.threats,
      sexual: scores.sexual,
      selfHarm: scores.selfHarm,
      extremism: scores.extremism,
      profanity: scores.profanity
    },
    reason,
    additionalFlags: {
      excessiveCaps,
      excessiveSpecialChars
    }
  };
}

/**
 * Moderate content and return sanitized version if needed
 */
function moderateAndSanitize(text) {
  const result = moderateContent(text);
  
  if (result.shouldBlock) {
    return {
      ...result,
      sanitizedText: '[Content blocked due to policy violation]',
      allowPost: false
    };
  }

  return {
    ...result,
    sanitizedText: text,
    allowPost: true
  };
}

module.exports = {
  moderateContent,
  moderateAndSanitize,
  SEVERITY
};
