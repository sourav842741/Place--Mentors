export const fruitboxLevels = [
  {
    id: 1,
    title: "Move Apple Right",
    instruction: "Move the apple to the right side of the container using justify-content.",
    starterCode: "display: flex;",
    acceptedAnswers: [
      "justify-content: flex-end;",
      "justify-content:flex-end"
    ],
    hint: "Use justify-content: flex-end to push items to the right.",
    xpReward: 10,
    fruits: [{ type: '🍎', order: 1, targetX: 'right' }]
  },
  {
    id: 2,
    title: "Center the Banana",
    instruction: "Center the banana horizontally in the container.",
    starterCode: "display: flex;",
    acceptedAnswers: [
      "justify-content: center;",
      "justify-content:center"
    ],
    hint: "justify-content: center aligns items in the center.",
    xpReward: 10,
    fruits: [{ type: '🍌', order: 1, targetX: 'center' }]
  },
  {
    id: 3,
    title: "Space Between Fruits",
    instruction: "Place apple and banana at opposite ends with space between.",
    starterCode: "display: flex;",
    acceptedAnswers: [
      "justify-content: space-between;",
      "justify-content:space-between"
    ],
    hint: "space-between distributes space between items.",
    xpReward: 15,
    fruits: [{ type: '🍎', order: 1 }, { type: '🍌', order: 2 }]
  },
  {
    id: 4,
    title: "Center Vertically",
    instruction: "Vertically center the orange in the container.",
    starterCode: "display: flex;\nheight: 100%;",
    acceptedAnswers: [
      "align-items: center;",
      "align-items:center"
    ],
    hint: "align-items controls vertical alignment.",
    xpReward: 15,
    fruits: [{ type: '🍊', order: 1, targetY: 'center' }]
  },
  {
    id: 5,
    title: "Bottom Align",
    instruction: "Push the grape to the bottom of the container.",
    starterCode: "display: flex;\nheight: 100%;",
    acceptedAnswers: [
      "align-items: flex-end;",
      "align-items:flex-end"
    ],
    hint: "flex-end aligns to the bottom.",
    xpReward: 15,
    fruits: [{ type: '🍇', order: 1, targetY: 'bottom' }]
  },
  {
    id: 6,
    title: "Reverse Order",
    instruction: "Reverse the order of apple and banana (banana left, apple right).",
    starterCode: "display: flex;\njustify-content: flex-end;",
    acceptedAnswers: [
      "flex-direction: row-reverse;",
      "flex-direction:row-reverse"
    ],
    hint: "row-reverse flips horizontal direction.",
    xpReward: 20,
    fruits: [{ type: '🍎', order: 2 }, { type: '🍌', order: 1 }]
  },
  {
    id: 7,
    title: "Vertical Layout",
    instruction: "Stack fruits vertically from top to bottom.",
    starterCode: "display: flex;\nheight: 100%;",
    acceptedAnswers: [
      "flex-direction: column;",
      "flex-direction:column"
    ],
    hint: "column makes flex vertical.",
    xpReward: 20,
    fruits: [{ type: '🍎', order: 1, targetY: 'top' }, { type: '🍌', order: 2 }]
  },
  {
    id: 8,
    title: "Space Around",
    instruction: "Distribute space around all three fruits evenly.",
    starterCode: "display: flex;",
    acceptedAnswers: [
      "justify-content: space-around;",
      "justify-content:space-around"
    ],
    hint: "space-around adds space on both sides of items.",
    xpReward: 20,
    fruits: [{ type: '🍎', order: 1 }, { type: '🍌', order: 2 }, { type: '🍊', order: 3 }]
  },
  {
    id: 9,
    title: "Space Evenly",
    instruction: "Distribute equal space between and around fruits.",
    starterCode: "display: flex;",
    acceptedAnswers: [
      "justify-content: space-evenly;",
      "justify-content:space-evenly"
    ],
    hint: "space-evenly is perfectly uniform spacing.",
    xpReward: 20,
    fruits: [{ type: '🍎', order: 1 }, { type: '🍌', order: 2 }, { type: '🍊', order: 3 }]
  },
  {
    id: 10,
    title: "Wrap Fruits",
    instruction: "Make four fruits wrap to second row when space runs out.",
    starterCode: "display: flex;\nwidth: 100%;",
    acceptedAnswers: [
      "flex-wrap: wrap;",
      "flex-wrap:wrap"
    ],
    hint: "flex-wrap allows items to wrap to new lines.",
    xpReward: 25,
    fruits: [
      { type: '🍎', order: 1 }, { type: '🍌', order: 2 },
      { type: '🍊', order: 3 }, { type: '🍇', order: 4 }
    ]
  },
  {
    id: 11,
    title: "Change Order",
    instruction: "Make banana appear first, then grape, then apple (use order).",
    starterCode: "display: flex;",
    acceptedAnswers: [
      ".banana { order: 1; }",
      ".grape { order: 2; }",
      ".apple { order: 3; }"
    ],
    hint: "order property changes visual order without changing HTML.",
    xpReward: 25,
    fruits: [{ type: '🍎', class: 'apple', order: 3 }, { type: '🍌', class: 'banana', order: 1 }, { type: '🍇', class: 'grape', order: 2 }]
  },
  {
    id: 12,
    title: "Align Self Bottom",
    instruction: "Make only the strawberry align to bottom, others center.",
    starterCode: "display: flex;\nheight: 100%;\nalign-items: center;",
    acceptedAnswers: [
      ".strawberry { align-self: flex-end; }",
      ".strawberry { align-self:flex-end; }"
    ],
    hint: "align-self overrides align-items for individual items.",
    xpReward: 25,
    fruits: [
      { type: '🍎', order: 1 },
      { type: '🍓', class: 'strawberry', targetY: 'bottom' },
      { type: '🍌', order: 3 }
    ]
  },
  {
    id: 13,
    title: "Add Gap",
    instruction: "Add spacing between all fruits using gap.",
    starterCode: "display: flex;",
    acceptedAnswers: [
      "gap: 1rem;",
      "gap:1rem",
      "gap: 2rem;",
      "gap:2rem"
    ],
    hint: "gap adds space between flex items.",
    xpReward: 25,
    fruits: [{ type: '🍎', order: 1 }, { type: '🍌', order: 2 }, { type: '🍊', order: 3 }]
  },
  {
    id: 14,
    title: "Combine Alignments",
    instruction: "Center horizontally and align to bottom.",
    starterCode: "display: flex;\nheight: 100%;",
    acceptedAnswers: [
      "justify-content: center;\nalign-items: flex-end;",
      "justify-content:center;\nalign-items:flex-end"
    ],
    hint: "Combine justify-content and align-items.",
    xpReward: 30,
    fruits: [{ type: '🍎', order: 1, targetX: 'center', targetY: 'bottom' }]
  },
  {
    id: 15,
    title: "Flexbox Master Challenge",
    instruction: "Wrap fruits with gap, reverse column direction, strawberry bottom-right using order.",
    starterCode: "display: flex;\nheight: 100%;",
    acceptedAnswers: [
      "flex-direction: column-reverse;\nflex-wrap: wrap;\ngap: 1rem;\n.strawberry { order: 4; align-self: flex-end; }",
      "flex-wrap:wrap;\ngap:1rem;\nflex-direction:column-reverse;\n.strawberry{order:4;align-self:flex-end;}"
    ],
    hint: "Combine everything you've learned!",
    xpReward: 50,
    fruits: [
      { type: '🍎', order: 1 },
      { type: '🍌', order: 2 },
      { type: '🍊', order: 3 },
      { type: '🍓', class: 'strawberry', order: 4 }
    ]
  }
];

