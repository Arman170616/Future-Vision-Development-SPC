"""
Replace the old FutureInnvo website content with Future Vision Development SPC content.

Run once:  venv/bin/python manage.py shell < seed_future_vision.py

- Blog: removes the old technology posts/categories/tags and publishes four
  insurance & loss-adjusting articles.
- Careers: removes the old software job openings (only those without
  applications) and adds loss-adjusting openings as DRAFTS (is_active=False),
  so nothing is advertised until someone reviews and activates them.
- Activities: removes the old tech events, upcoming events and gallery items,
  and adds the brochure photos to the gallery.
Team members, tasks, expenses, courses and projects are not touched.
"""
from django.db import transaction
from django.utils import timezone

from activities.models import Activity, Gallery, UpcomingEvent
from blog.models import BlogCategory, BlogPost, BlogPostTag, BlogTag
from careers.models import JobOpening, JobRequirement, JobResponsibility

AUTHOR = 'Future Vision Development'

POSTS = [
    {
        'title': 'What Does an Independent Loss Adjuster Do?',
        'category': 'Loss Adjusting',
        'image': '/images/structural-damage.jpg',
        'read_time': '5 min read',
        'featured': True,
        'tags': ['Loss Adjusting', 'Insurance Claims'],
        'excerpt': 'From the first site visit to the final report, an independent loss adjuster investigates the cause of a loss, '
                   'checks it against the policy and recommends a fair settlement. Here is how the process works.',
        'content': """
<p>When an insured loss happens — a flood, a fire, a damaged cargo consignment — the insurer needs an independent, expert view of what happened and what it costs. That is the job of the loss adjuster.</p>
<h2>1. Instruction and first contact</h2>
<p>The insurer or broker instructs us and an adjuster is assigned to the claim. The insured gets a single point of contact with direct phone and email details — no call centre.</p>
<h2>2. Site inspection</h2>
<p>Our engineers attend the site, anywhere in the Sultanate, to record the damage, establish the cause and collect the documents needed for the claim.</p>
<h2>3. Policy analysis</h2>
<p>Every assessment is tailored to the specific policy: the cover, the conditions, the exclusions and the sum insured. The same damage can lead to very different outcomes under different policies.</p>
<h2>4. Quantum and cost control</h2>
<p>Repair estimates, valuations and quotations are reviewed so that the settlement reflects the real cost of putting things right — no more and no less.</p>
<h2>5. Reporting</h2>
<p>We issue a <strong>First Analysis Primary Report within 3 working days</strong>, update and budgetary reports as the claim progresses, and a <strong>Final Claim Analysis Report</strong> as soon as the claim has been dealt with.</p>
<p>The result is a claim handled with technical excellence, transparency and integrity — fair to the insurer, the insured and the policy that binds them.</p>
""",
    },
    {
        'title': 'After a Flood: Steps to Take Before the Adjuster Arrives',
        'category': 'Insurance Claims',
        'image': '/images/flood.jpg',
        'read_time': '4 min read',
        'featured': False,
        'tags': ['Flood', 'Property', 'Insurance Claims'],
        'excerpt': 'Storms and flash floods can cause heavy damage to homes and businesses. A few simple steps protect your '
                   'safety, limit further loss and make your insurance claim faster to settle.',
        'content': """
<p>Heavy rain and flash floods can damage buildings, contents, stock and vehicles within hours. What you do in the first days after the event makes a real difference to your claim.</p>
<h2>Stay safe first</h2>
<p>Do not enter flooded buildings until it is safe. Switch off electricity at the main board if you can do so safely, and keep away from damaged structures.</p>
<h2>Notify your insurer or broker quickly</h2>
<p>Report the loss as soon as possible and keep your policy number to hand. Early notification lets the adjuster attend while the evidence is still fresh.</p>
<h2>Record the damage</h2>
<ul>
<li>Take photos and videos of every affected room, item and the water level marks.</li>
<li>Keep damaged items where possible — do not throw them away before the adjuster has seen them, unless they are a health hazard.</li>
<li>Collect purchase invoices, stock records and maintenance documents.</li>
</ul>
<h2>Prevent further damage</h2>
<p>Take reasonable steps to limit the loss — move undamaged stock to a dry place, ventilate rooms and arrange temporary protection. Keep the receipts: reasonable mitigation costs are usually part of the claim.</p>
<h2>Do not start permanent repairs too early</h2>
<p>Agree the scope and cost of permanent repairs with the adjuster first. This avoids disputes about what was damaged and what the repair should cost.</p>
""",
    },
    {
        'title': "Marine Cargo Cover vs Haulier's Liability: What's the Difference?",
        'category': 'Marine',
        'image': '/images/site-incident.jpg',
        'read_time': '5 min read',
        'featured': False,
        'tags': ['Marine', "Haulier's Liability", 'Cargo'],
        'excerpt': "When goods are damaged in transit, two different insurances may respond: the cargo owner's marine cover and "
                   "the transporter's haulier's liability. Knowing which applies speeds up the claim.",
        'content': """
<p>Goods moving by road or sea can be damaged by accidents, poor handling, water ingress or theft. Two kinds of insurance are commonly involved, and they work very differently.</p>
<h2>Marine cargo insurance</h2>
<p>Marine cargo (or "marine open") cover is bought by the owner of the goods — the importer, exporter or trader. It protects the value of the goods themselves during transit, usually from warehouse to warehouse, whoever was at fault.</p>
<h2>Haulier's liability insurance</h2>
<p>Haulier's (carrier's) liability cover is bought by the transport company. It responds when the haulier is legally liable for loss of or damage to the goods in its care — and only up to the limits of that liability.</p>
<h2>Why the survey matters</h2>
<p>A prompt cargo survey records the condition of the goods and packaging, the cause of the damage and the quantities affected. That evidence decides which policy responds, whether a recovery can be made from the carrier, and how much the loss is worth.</p>
<h2>Tips for cargo owners and hauliers</h2>
<ul>
<li>Note any damage on the delivery receipt before signing.</li>
<li>Keep the damaged goods and packaging available for inspection.</li>
<li>Notify both your insurer and the other party in writing as soon as possible.</li>
</ul>
""",
    },
    {
        'title': 'Why Pre-Risk Inspections Matter for Businesses and Insurers',
        'category': 'Risk Management',
        'image': '/images/fire.jpg',
        'read_time': '4 min read',
        'featured': False,
        'tags': ['Risk Management', 'Fire', 'Pre-Risk Inspection'],
        'excerpt': 'A pre-risk inspection gives insurers a clear picture of a property before cover starts — and gives the '
                   'owner practical recommendations that reduce the chance of a serious loss.',
        'content': """
<p>Before insuring a factory, hotel, warehouse or construction project, many insurers ask for a pre-risk inspection. It is one of the most cost-effective tools in risk management.</p>
<h2>What we look at</h2>
<ul>
<li>Construction, occupancy and layout of the premises.</li>
<li>Fire protection: detection, alarms, extinguishers, hydrants and sprinklers.</li>
<li>Electrical installations, housekeeping and storage of hazardous materials.</li>
<li>Security, flood exposure and business continuity arrangements.</li>
</ul>
<h2>What the insurer gains</h2>
<p>An accurate description of the risk helps the underwriter set the right terms, conditions and sums insured — and avoids surprises when a claim is made.</p>
<h2>What the business gains</h2>
<p>The inspection report includes practical recommendations. Simple improvements — better housekeeping, a maintained fire system, safer storage — can prevent a loss altogether, and keep the business running.</p>
""",
    },
]

JOBS = [
    {
        'title': 'Loss Adjuster / Claims Surveyor',
        'department': 'claims',
        'location': 'Muscat, Oman',
        'job_type': 'full-time',
        'experience_required': '3+ years',
        'description': 'Investigate and assess property, engineering and motor insurance claims across the Sultanate, and '
                       'prepare clear, policy-based reports for insurers.',
        'requirements': [
            'Bachelor\'s degree in engineering (civil, mechanical or electrical preferred)',
            '3+ years of experience in loss adjusting or claims surveying',
            'CII qualification or progress towards it is an advantage',
            'Strong report writing in English; Arabic is an advantage',
            'Valid Omani driving licence and willingness to travel',
        ],
        'responsibilities': [
            'Attend sites to inspect damage and establish the cause of loss',
            'Review policy cover, conditions and exclusions for each claim',
            'Assess repair estimates, valuations and quantum',
            'Issue primary, update and final reports on schedule',
        ],
    },
    {
        'title': 'Marine Cargo Surveyor',
        'department': 'marine',
        'location': 'Salalah, Oman',
        'job_type': 'full-time',
        'experience_required': '2+ years',
        'description': "Carry out marine cargo, haulier's liability and quality assurance surveys for goods moving by road and sea.",
        'requirements': [
            'Degree or diploma in engineering, marine studies or a related field',
            '2+ years of experience in cargo or marine surveys',
            'Good knowledge of transport documents and cargo handling',
            'Clear written English',
        ],
        'responsibilities': [
            'Survey damaged cargo at ports, warehouses and consignee premises',
            'Record condition, quantities and the cause of damage',
            'Prepare survey reports supporting claims and recoveries',
        ],
    },
    {
        'title': 'Graduate Trainee Engineer — Loss Adjusting',
        'department': 'engineering',
        'location': 'Muscat, Oman',
        'job_type': 'internship',
        'experience_required': '0-1 years',
        'description': 'Learn loss adjusting on real claims alongside our engineers: site inspections, analysis and reporting.',
        'requirements': [
            'Recent bachelor\'s degree in civil, mechanical or electrical engineering',
            'Good English; Arabic is an advantage',
            'Willingness to travel within Oman',
        ],
        'responsibilities': [
            'Accompany engineers on site inspections',
            'Help prepare photos, measurements and draft reports',
            'Learn policy analysis and claims procedures',
        ],
    },
]

GALLERY = [
    ('Flood damage', 'Flooded streets after a storm — one of the catastrophe losses we assess.', '/images/flood.jpg'),
    ('Structural damage', 'Building damaged by coastal erosion — structural damage and evaluation.', '/images/structural-damage.jpg'),
    ('Fire & perils', 'Vehicle and building fire — fire & perils claims.', '/images/fire.jpg'),
    ('Site incident', "Incident at a construction site — contractor's risk claims.", '/images/site-incident.jpg'),
]

with transaction.atomic():
    # ---------------------------------------------------------------- blog
    BlogPostTag.objects.all().delete()
    BlogPost.objects.all().delete()
    BlogTag.objects.all().delete()
    BlogCategory.objects.all().delete()
    now = timezone.now()
    for i, p in enumerate(POSTS):
        category, _ = BlogCategory.objects.get_or_create(name=p['category'])
        post = BlogPost.objects.create(
            title=p['title'], excerpt=p['excerpt'], content=p['content'].strip(), author=AUTHOR,
            category=category, image=p['image'], read_time=p['read_time'], featured=p['featured'],
            published_at=now - timezone.timedelta(days=i * 7),
        )
        for name in p['tags']:
            tag, _ = BlogTag.objects.get_or_create(name=name)
            BlogPostTag.objects.create(post=post, tag=tag)

    # ---------------------------------------------------------------- careers
    kept = []
    for job in JobOpening.objects.all():
        if job.applications.exists():
            job.is_active = False  # keep applicants' data, just stop advertising it
            job.save(update_fields=['is_active'])
            kept.append(job.title)
        else:
            job.delete()
    for j in JOBS:
        job = JobOpening.objects.create(
            title=j['title'], department=j['department'], location=j['location'], job_type=j['job_type'],
            experience_required=j['experience_required'], description=j['description'], is_active=False,
        )
        for r in j['requirements']:
            JobRequirement.objects.create(job=job, requirement=r)
        for r in j['responsibilities']:
            JobResponsibility.objects.create(job=job, responsibility=r)

    # ---------------------------------------------------------------- activities & gallery
    Gallery.objects.all().delete()
    UpcomingEvent.objects.all().delete()
    Activity.objects.all().delete()
    today = timezone.localdate()
    for i, (title, description, url) in enumerate(GALLERY):
        Gallery.objects.create(
            title=title, description=description, media_type='photo', category='other',
            image_url=url, taken_date=today, is_featured=i < 2, is_public=True,
        )

print('Blog posts:', BlogPost.objects.count())
print('Job openings (drafts):', JobOpening.objects.filter(is_active=False).count(), '| old jobs kept as inactive:', kept)
print('Activities:', Activity.objects.count(), '| Events:', UpcomingEvent.objects.count(), '| Gallery:', Gallery.objects.count())
