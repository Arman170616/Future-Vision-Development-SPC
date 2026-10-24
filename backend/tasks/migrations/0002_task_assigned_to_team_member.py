from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    """Assignee moves from a login account to a team member.

    Remove + add (rather than AlterField) so old user ids are never read as team-member ids.
    """

    dependencies = [
        ('teams', '0001_initial'),
        ('tasks', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(model_name='task', name='assigned_to'),
        migrations.AddField(
            model_name='task',
            name='assigned_to',
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='tasks', to='teams.teammember',
                help_text='Team member responsible for this task. Add people under Teams → Team members.',
            ),
        ),
    ]
