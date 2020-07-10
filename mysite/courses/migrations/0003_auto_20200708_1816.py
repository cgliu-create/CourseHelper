# Generated by Django 3.0.7 on 2020-07-08 18:16

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_auto_20200706_2049'),
    ]

    operations = [
        migrations.AlterField(
            model_name='enrolled',
            name='students',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='enrolled', to='courses.Student'),
        ),
    ]