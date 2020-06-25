# Generated by Django 3.0.7 on 2020-06-24 21:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0004_auto_20200624_2042'),
    ]

    operations = [
        migrations.RenameField(
            model_name='requirement',
            old_name='numcoursesneeded',
            new_name='credit',
        ),
        migrations.RemoveField(
            model_name='requirement',
            name='categories',
        ),
        migrations.RemoveField(
            model_name='requirement',
            name='creditrange',
        ),
        migrations.CreateModel(
            name='SubCategory',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('subcategory', models.CharField(max_length=64)),
                ('note', models.CharField(max_length=64)),
                ('categories', models.ManyToManyField(related_name='subcategories', to='courses.Category')),
            ],
        ),
        migrations.AddField(
            model_name='requirement',
            name='subcategories',
            field=models.ManyToManyField(related_name='requirements', to='courses.SubCategory'),
        ),
    ]